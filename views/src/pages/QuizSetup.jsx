import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

import { useNavigate } from 'react-router-dom'

import useAxios from '../hooks/useAxios'

// Page for user to select settings for the quiz

// placeholder questions
// const questions = [
//     {
//       question_id: 1,
//       number: 1,
//       prompt: "Placeholder question 1",
//       category: "General",
//       difficulty: "Easy",
//       type: "multiple choice",
//       choices: ["Option A", "Option B", "Option C", "Option D"],
//       total_questions: 10,
//       allotted_time: 30,
//     },
//     {
//       question_id: 2,
//       number: 2,
//       prompt: "Placeholder question 2",
//       category: "Science",
//       difficulty: "Medium",
//       type: "true/false",
//       choices: ["True", "False"],
//       total_questions: 10,
//       allotted_time: 20,
//     },
//     {
//       question_id: 3,
//       number: 3,
//       prompt: "Placeholder question 3",
//       category: "Math",
//       difficulty: "Hard",
//       type: "multiple choice",
//       choices: ["Option A", "Option B", "Option C", "Option D"],
//       total_questions: 10,
//       allotted_time: 40,
//     },
//     {
//       question_id: 4,
//       number: 4,
//       prompt: "Placeholder question 4",
//       category: "History",
//       difficulty: "Easy",
//       type: "multiple choice",
//       choices: ["Option A", "Option B", "Option C", "Option D"],
//       total_questions: 10,
//       allotted_time: 30,
//     },
//     {
//       question_id: 5,
//       number: 5,
//       prompt: "Placeholder question 5",
//       category: "Geography",
//       difficulty: "Medium",
//       type: "true/false",
//       choices: ["True", "False"],
//       total_questions: 10,
//       allotted_time: 25,
//     }
// ]

export default function QuizSetup() {
    const axios = useAxios()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        // console.log(`Amount: ${e.target.amount.value}`)
        // console.log(`Category: ${e.target.category.value}`)
        // console.log(`Difficulty: ${e.target.difficulty.value}`)
        // console.log(`Type: ${e.target.type.value}`)

        // const question = {
        //     "number": 1,
        //     "prompt": "What is the capital of France?",
        //     "choices": ["Paris", "London", "Berlin", "Madrid"],
        //     "category": "Geography",
        //     "type": "multiple",
        //     "total_questions": e.target.amount.value
        // }

        // navigate('/quiz/play', {state: {questions: questions}})
        
        try {
            const response = await axios.post(
                '/quiz', 
                {
                    "amount": e.target.amount.value,
                    "category": e.target.category.value,
                    "difficulty": e.target.difficulty.value,
                    "type": e.target.type.value
                },
                // testing only
                // {
                //     headers: {
                //         'Authorization' : 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzFlZmU1NWEzOTU1ZTIzZDhhODdjYjkiLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzMwMjI3NzM3LCJleHAiOjE3MzA0MDc3Mzd9.oY7mj-Z-bpHfWvysYMy7iqpcGCJ88LZXSlNXJf-64pQ'
                //     }
                // }
            )
            
            console.log(response.data)
            console.log(response.data.length)    
            // navigate to the quiz page with the questions
            navigate('/quiz/play', {state: {questions: response.data}})

        } catch (error) {
            console.error(error)
        }        

    }

    return (
        <Card className='d-flex flex-row justify-content-center w-50 shadow-sm mt-3'>
            <Form className='pt-3 pb-3 w-75' onSubmit={handleSubmit}>
                <Form.Group className='mb-3' controlId='amount'>
                    <Form.Label>Choose the number of questions</Form.Label>
                    <Form.Control type="number" placeholder='10' defaultValue={10} min='1' max='50' required/>
                </Form.Group>

                <Form.Group className='mb-3' controlId='category'>
                    <Form.Label>Choose the category</Form.Label>
                    <Form.Select>
                        <option value=''>Any Category</option>
                        <option value='9'>General Knowledge</option>
                        <option value='10'>Books</option>
                        <option value='11'>Film</option>
                        <option value='12'>Music</option>
                        <option value='13'>Musicals & Theatres</option>
                        <option value='14'>Television</option>
                        <option value='15'>Video Games</option>
                        <option value='16'>Board Games</option>
                        <option value='17'>Science & Nature</option>
                        <option value='18'>Computers</option>
                        <option value='19'>Mathematics</option>
                        <option value='20'>Mythology</option>
                        <option value='21'>Sports</option>
                        <option value='22'>Geography</option>
                        <option value='23'>History</option>
                        <option value='24'>Politics</option>
                        <option value='25'>Art</option>
                        <option value='26'>Celebrities</option>
                        <option value='27'>Animals</option>
                        <option value='28'>Vehicles</option>
                        <option value='29'>Comics</option>
                        <option value='30'>Gadgets</option>
                        <option value='31'>Japanese Anime & Manga</option>
                        <option value='32'>Cartoon & Animations</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className='mb-3' controlId='difficulty'>
                    <Form.Label>Choose the difficulty</Form.Label>
                    <Form.Select>
                        <option value=''>Any Difficulty</option>
                        <option value='easy'>Easy</option>
                        <option value='medium'>Medium</option>
                        <option value='hard'>Hard</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group className='mb-3' controlId='type'>
                    <Form.Label>Choose the type</Form.Label>
                    <Form.Select>
                        <option value=''>Any Type</option>
                        <option value='multiple'>Multiple Choice</option>
                        <option value='boolean'>True / False</option>
                    </Form.Select>
                </Form.Group>
                
                <Button variant="primary" type="submit">Start Quiz</Button>
            </Form>
    </Card>
    )
}