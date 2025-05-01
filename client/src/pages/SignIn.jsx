import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react'
import axios from 'axios'

const SignIn = () => {
  const [formData, setFormData] = useState({ email: '',username:'', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value.trim() })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.email ||!formData.username || !formData.password) {
      return setError('Please fill out all fields.')
    }

    try {
      setLoading(true)
      setError(null)

      const res = await axios.post('http://localhost:8080/api/v1/login', formData, {
        headers: { 'Content-Type': 'application/json' }
      })

      // Save JWT and navigate
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('email', res.data.email)
      localStorage.setItem('username', res.data.username)

      navigate('/dashboard')
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen mt-20">
      <div className="p-3 max-w-3xl mx-auto flex flex-col md:flex-row md:items-center gap-5">
        {/* Left Side */}
        <div className="flex-1">
          <Link to="/" className="font-bold text-4xl dark:text-white">
            <span className="px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-lg">
              Record
            </span>
            Log
          </Link>
          <p className="text-sm mt-5">
            Sign in with your email and password to access the dashboard.
          </p>
        </div>

        {/* Right Side */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label value="Your email" />
              <TextInput
                type="email"
                id="email"
                placeholder="name@company.com"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your username" />
              <TextInput
                type="username"
                id="username"
                placeholder="12345"
                onChange={handleChange}
              />
            </div>
            <div>
              <Label value="Your password" />
              <TextInput
                type="password"
                id="password"
                placeholder="********"
                onChange={handleChange}
              />
            </div>
            <Button gradientDuoTone="purpleToPink" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" />
                  <span className="pl-3">Signing in...</span>
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          {error && (
            <Alert color="failure" className="mt-5">
              {error}
            </Alert>
          )}
          <div className="flex gap-2 text-sm mt-5">
            <span>Don't have an account?</span>
            <Link to="/sign-up" className="text-blue-500">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
