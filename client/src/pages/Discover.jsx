import React, { useState } from 'react'
import { dummyConnectionsData } from '../assets/assets'
import { Search } from 'lucide-react'
import UserCard from '../components/UserCard'
import Loading from '../components/Loading'

const Discover = () => {

  const [input, setInput] = useState('')
  const [users, setUsers] = useState(dummyConnectionsData)
  const [loading, setLoading] = useState(false)

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      setLoading(true)

      // Simulate API call
      setTimeout(() => {
        const filteredUsers = dummyConnectionsData.filter((user) =>
          user.name.toLowerCase().includes(input.toLowerCase()) ||
          user.username?.toLowerCase().includes(input.toLowerCase()) ||
          user.bio?.toLowerCase().includes(input.toLowerCase()) ||
          user.location?.toLowerCase().includes(input.toLowerCase())
        )

        setUsers(filteredUsers)
        setLoading(false)
      }, 800)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover
          </h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-10 shadow-sm rounded-xl border border-slate-200 bg-white">
          <div className="p-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio, or location..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && <Loading height="50vh" />}

        {/* Users Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
            {users.length > 0 ? (
              users.map((user) => (
                <UserCard key={user._id} user={user} />
              ))
            ) : (
              <p className="col-span-full text-center text-slate-500">
                No users found.
              </p>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Discover
