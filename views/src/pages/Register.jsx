import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'

import { useState } from 'react'
import useAxios from '../hooks/useAxios'
import useAuth from '../hooks/useAuth'
import { useNavigate, Navigate } from 'react-router-dom'
import { Link } from 'react-router-dom'

function Register() {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const axios = useAxios()

    const { auth } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.post(
                '/register',
                {"email": email, "username": username, "password": password},
            )

            console.log(JSON.stringify(response?.data))
            setEmail('')
            setUsername('')
            setPassword('')

            navigate('/login')
        } catch (err) {
            if (!err?.response) {
                console.error("No response")
            }
            else if (err.response) {
                console.error(err.response.data.message)
            }
            else {
                console.error(err)
            }
        }
    }

    return (
        auth
        ? <Navigate to='/' replace />
        : <Card className='d-flex flex-row justify-content-center w-50 shadow-sm mt-3'>
            <Form className='pt-3 pb-3 w-75' onSubmit={handleSubmit}>
                <Form.Group className='mb-3' controlId='formEmail'>
                    <Form.Label>Email address</Form.Label>
                    <Form.Control type="email" placeholder='abc@email.com' onChange={(e) => setEmail(e.target.value)} value={email}/>
                </Form.Group>

                <Form.Group className='mb-3' controlId='formUsername'>
                    <Form.Label>Username</Form.Label>
                    <Form.Control type="username" placeholder='Username' onChange={(e) => setUsername(e.target.value)} value={username}/>
                </Form.Group>

                <Form.Group className='mb-3' controlId='formPassword'>
                    <Form.Label>Password</Form.Label>
                    <Form.Control type="password" placeholder='Password' onChange={(e) => setPassword(e.target.value)} value={password}/>
                </Form.Group>
                
                <Button variant="primary" type="submit">Register</Button>
                <hr />
                <Form.Text>Already have an account? <Link to="/login">Login</Link></Form.Text>
            </Form>
        </Card>
    )
}

export default Register