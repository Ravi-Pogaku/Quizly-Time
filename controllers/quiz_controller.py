from flask import request, Blueprint, jsonify, make_response
import requests
from flask_socketio import emit, Namespace
import os
from datetime import datetime 
from time import sleep
from threading import Thread

# import models
from models.user_model import User
from models.quiz_model import Quiz
from models.question_model import Question
from models.quiz_model import AnsweredQuestion

# import service functions
from services.auth_service import token_required
from services.quiz_service import store_questions, create_quiz_questions

from socket_manager import socketio 

quiz_bp = Blueprint('quiz_bp', __name__)

# dictionary to map category id to category name
# needed for title of random quizzes
category_dict = {
    '': 'Any Category',
    '9': "General Knowledge",
    '10': "Entertainment: Books",
    '11': "Entertainment: Film",
    '12': "Entertainment: Music",
    '13': "Entertainment: Musicals & Theatres",
    '14': "Entertainment: Television",
    '15': "Entertainment: Video Games",
    '16': "Entertainment: Board Games",
    '17': "Science & Nature",
    '18': "Science: Computers",
    '19': "Science: Mathematics",
    '20': "Mythology",
    '21': "Sports",
    '22': "Geography",
    '23': "History",
    '24': "Politics",
    '25': "Art",
    '26': "Celebrities",
    '27': "Animals",
    '28': "Vehicles",
    '29': "Entertainment: Comics",
    '30': "Science: Gadgets",
    '31': "Entertainment: Japanese Anime & Manga",
    '32': "Entertainment: Cartoon & Animations"
}

# get quiz questions from the API
@quiz_bp.route("/quiz", methods=["POST"])
@token_required("access") 
def create_random_quiz(user_data):
    amount = request.json.get('amount', 10)
    type = request.json.get('type', "")
    difficulty = request.json.get('difficulty', "")
    category = request.json.get('category', "")

    print(request.json)

    # empty string for the query param are handled by the API, treats them as if they weren't included
    API_URL = f'https://opentdb.com/api.php?amount={amount}&type={type}&difficulty={difficulty}&category={category}'

    print(API_URL)

    response = requests.get(API_URL).json()

    print(response)

    # store the questions in the database, and return the question objects as a list
    questions = store_questions(response['results'])
    
    # create a new quiz object and store it in the database
    # set timestamp to the current time since the quiz is just starting
    quiz = Quiz(title=category_dict[category], score=0, timestamp=datetime.now(), total_questions=amount, questions=questions)
    quiz.save()

    # set the active_quiz field of the user to the quiz object
    user = User.objects(pk=user_data['sub']).first()
    user.active_quiz = quiz
    user.save()

    quiz_questions = create_quiz_questions(questions)

    print(quiz_questions)
     
    # return the quiz
    return make_response(jsonify(quiz_questions), 200)

@socketio.on('connect')
def connection():
    emit('no_namespace')

class SinglePlayerNamespace(Namespace):
    def on_connect(self):
        print('connected')

    def on_disconnect(self):
        print('disconnected')

    # check the user's answer and send result back to the client
    def on_check_answer(self, data):
        user = User.objects(email=data['email']).first()
        quiz = user.active_quiz
        question_index = data['question_index']

        # dont check the answer if the user doesn't have an active quiz
        if quiz is None:
            print("no active quiz")
            return

        # get the question object from the question id
        question = Question.objects(pk=data['question_id']).first()
        print(question.category)

        # check if the answer is correct
        if data['user_answer'] == question.correct_answer:
            print(question.correct_answer)
            
            # scale points to time left
            if data["time_left"] / data["max_time"] > 0.75:
                quiz.score += 10
            else:
                quiz.score += 10 * (data["time_left"] / data["max_time"])

        # store the question and user's answer in the answered_questions list
        quiz.answered_questions.append(
            AnsweredQuestion(question=question, user_answer=data['user_answer'])
        )

        quiz.save() 

        results = {
            "correct_answer": question.correct_answer,
            "question_index": question_index,
        }

        self.emit('answer_checked', results)

        # sleep some time so client can display correct/wrong
        # emit next_question or quiz_completed based on quiz progress
        # if next_question: just tell clients to increment to next q
        # if quiz_completed: send the score back to the client and store results in the database
        # in thread so sleep() doesnt block everything.
        if os.getenv('IS_TESTING') != '1': # threading breaks some tests.
            Thread(target=self.sleepThenContinueQuiz, kwargs={"user": user, "quiz": quiz}).start()
        else:
            self.sleepThenContinueQuiz(user=user, quiz=quiz)
    
    # HELPER FUNCTIONS
    # sleep after answer_checked so client can see their answers displayed
    def sleepThenContinueQuiz(self, user: User, quiz: Quiz, seconds: int=2):
        sleep(seconds)

        if len(quiz.answered_questions) != quiz.total_questions:
            self.emit('next_question')
            return

        # Quiz completed, store results.
        print('quiz completed', quiz.score)
        self.emit('quiz_completed', {"score": quiz.score})

        if quiz.user_created:
            # create copy of quiz for user
            quiz_history = Quiz(
                title=quiz.title, 
                score=quiz.score, 
                timestamp=datetime.now(), 
                total_questions=quiz.total_questions, 
                questions=quiz.questions,
                answered_questions=quiz.answered_questions
            )
            quiz_history.save()
            user.completed_single_quizzes.append(quiz_history)
        
            # reset original quiz
            quiz.answered_questions = []
            quiz.score = 0
            quiz.save()

        # else its an randomly created quiz and just append it
        else:
            user.completed_single_quizzes.append(quiz)

        user.active_quiz = None
        user.save()