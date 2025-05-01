import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'flowbite-react'

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      <header className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-4xl font-bold">CompanyOverflow</h1>
          <div>
            <Link to="/sign-in">
              <Button className="mr-2" color="light">
                Sign In
              </Button>
            </Link>
            <Link to="/sign-up">
              <Button gradientDuoTone="purpleToPink">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Introduction Section */}
      <section className="flex flex-col items-center justify-center py-20 bg-gray-100">
        <div className="max-w-4xl text-center">
          <h2 className="text-3xl font-semibold mb-4">Welcome to CompanyOverflow!</h2>
          <p className="text-lg text-gray-600 mb-8">
            Our platform helps you efficiently record, manage, and track important information. Whether it's company details, user records, or employee information, our system is here to streamline your operations.
          </p>
          <p className="text-lg text-gray-600 mb-4">
            By signing up, you'll be able to record your personal data, track your activity, and stay organized.
          </p>
          <p className="text-lg text-gray-600">
            If you're already a member, simply sign in to access your records and manage your profile.
          </p>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="flex flex-col items-center py-10">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Ready to get started?</h3>
        <div className="flex gap-4">
          <Link to="/sign-up">
            <Button gradientDuoTone="purpleToPink" size="lg">
              Sign Up Now
            </Button>
          </Link>
          <Link to="/sign-in">
            <Button className="text-purple-600 border-2 border-purple-600" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Section (optional) */}
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2025 Owner. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
