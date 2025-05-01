{/*
import { useState } from 'react';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username,setUsername]=useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/v1/register', { email,username, password });
      alert("Registration successful. Please log in.");
      navigate('/login');
    } catch (err) {
      console.error(err);
      alert("Signup failed. Try a different email.");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-20">
      <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <input className="w-full mb-2 p-2 border" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full mb-2 p-2 border" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="w-full mb-2 p-2 border" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="bg-green-600 text-white py-2 px-4 w-full rounded" type="submit">Register</button>
      </form>
    </div>
  );
}


*/}



import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react'
import axios from 'axios'

const SignUp = () => {
  const [formData, setFormData] = useState({ email: '', username: '', password: '' })
  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { email, username, password } = formData

    if (!username || !email || !password) {
      return setErrorMessage('Please fill out all fields.')
    }

    try {
      setLoading(true)
      setErrorMessage(null)

      const payload = { email, username, password }

      const res = await axios.post('http://localhost:8080/api/v1/register', payload, {
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.status === 200 || res.status === 201) {
        navigate('/sign-in')
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMessage(err.response.data.error)
      } else {
        setErrorMessage('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen mt-20'>
      <div className='p-3 max-w-3xl mx-auto flex flex-col md:flex-row md:items-center gap-5'>
        <div className='flex-1'>
          <Link to="/" className="font-bold text-4xl dark:text-white">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg">
             Record-
            </span>
            Book
          </Link>
          <p className='text-sm mt-5'>
            This is a demo project. You can sign up with your email and password or with Google.
          </p>
        </div>
        <div className='flex-1'>
          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
              <Label value='Your email' />
              <TextInput type='email' placeholder='name@company.com' id='email' onChange={handleChange} />
            </div>
            <div>
              <Label value='Your numeric username (ID)' />
              <TextInput type='text' placeholder='123456' id='username' onChange={handleChange} />
            </div>
            <div>
              <Label value='Your password' />
              <TextInput type='password' placeholder='Password' id='password' onChange={handleChange} />
            </div>
            <Button gradientDuoTone='purpleToPink' type='submit' disabled={loading}>
              {loading ? (
                <>
                  <Spinner size='sm' />
                  <span className='pl-3'>Loading...</span>
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
          <div className='flex gap-2 text-sm mt-5'>
            <span>Have an account?</span>
            <Link to='/sign-in' className='text-blue-500'>
              Sign In
            </Link>
          </div>
          {errorMessage && (
            <Alert className='mt-5' color='failure'>
              {errorMessage}
            </Alert>
          )}
        </div>
      </div>
    </div>
  )
}

export default SignUp
