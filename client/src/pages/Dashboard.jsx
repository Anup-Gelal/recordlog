{/*
import React, { useEffect, useState } from 'react'
import { Button, Table, TextInput, Label } from 'flowbite-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({})
  const [notes, setNotes] = useState([])  // Initialize as an empty array
  const [approvedBy, setApprovedBy] = useState('')
  const [content, setContent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingNote, setEditingNote] = useState(null) // Track the note being edited

  useEffect(() => {
    fetchProfile()
    fetchNotes()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setProfile(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/notes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setNotes(res.data.notes || [])  // Ensure notes are always set to an empty array if no notes are returned
    } catch (err) {
      console.error(err)
      setNotes([])  // Set to empty array in case of error
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/api/v1/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      localStorage.clear()
      navigate('/sign-in')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const handleCreateNote = async () => {
    if (!content.trim()) {
      console.warn("Note content is empty")
      return
    }
    try {
      const res = await axios.post('http://localhost:8080/api/v1/notes', {
        content: content
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      console.log("Note created:", res.data.note)
      setApprovedBy('')
      setContent('')
      fetchNotes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      fetchNotes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async () => {
    if (!content.trim()) {
      console.warn("Note content is empty")
      return
    }
    try {
      const res = await axios.put(`http://localhost:8080/api/v1/notes`, {
        id: editingNote.id,
        content: content,
        approved_by: approvedBy
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      console.log("Note updated:", res.data)
      setEditingNote(null)  // Reset editing state
      setContent('')
      setApprovedBy('')
      fetchNotes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/notes/search?approved_by=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setNotes(res.data.notes)
    } catch (err) {
      console.error(err)
    }
  }

  const exportPDF = () => {
    const token = localStorage.getItem('token')
    window.open(`http://localhost:8080/api/v1/notes/export/pdf?token=${token}`, '_blank')
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome, {profile.username} ({profile.email})
          </p>
        </div>
        <Button onClick={handleLogout} color="failure">Logout</Button>
      </div>

    
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextInput
          placeholder="Approved By"
          value={approvedBy}
          onChange={(e) => setApprovedBy(e.target.value)}
        />
        <TextInput
          placeholder="Write a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {editingNote ? (
          <Button onClick={handleUpdate}>Update Note</Button>
        ) : (
          <Button onClick={handleCreateNote}>Add Note</Button>
        )}
      </div>

    
      <div className="mb-4 flex gap-4">
        <TextInput
          placeholder="Search by Approved By..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={exportPDF} color="purple">Export PDF</Button>
      </div>

  
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>ID</Table.HeadCell>
          <Table.HeadCell>Approved By</Table.HeadCell>
          <Table.HeadCell>Note</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Time</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {notes.length > 0 ? notes.map(note => (
            <Table.Row key={note.id}>
              <Table.Cell>{note.id}</Table.Cell>
              <Table.Cell>{note.approved_by}</Table.Cell>
              <Table.Cell>{note.content}</Table.Cell>
              <Table.Cell>{note.date}</Table.Cell>
              <Table.Cell>{note.time}</Table.Cell>
              <Table.Cell>
                <Button size="xs" color="failure" onClick={() => handleDelete(note.id)}>Delete</Button>
                <Button size="xs" onClick={() => {
                  setEditingNote(note)
                  setContent(note.content)
                  setApprovedBy(note.approved_by)
                }}>Edit</Button>
              </Table.Cell>
            </Table.Row>
          )) : (
            <Table.Row>
              <Table.Cell colSpan="6" className="text-center">No notes available</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  )
}

export default Dashboard

*/}
import React, { useEffect, useState } from 'react'
import { Button, Table, TextInput, Label } from 'flowbite-react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Dashboard = () => {
  const navigate = useNavigate()
  const [profile, setProfile] = useState({})
  const [notes, setNotes] = useState([])
  const [approvedBy, setApprovedBy] = useState('')
  const [content, setContent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingNote,setEditingNote]=useState(null)

  useEffect(() => {
    fetchProfile()
    fetchNotes()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/profile', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setProfile(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchNotes = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/v1/notes', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setNotes(res.data.notes || [])
    } catch (err) {
      console.error(err)
      setNotes([])
    }
  }

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/api/v1/logout', {}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      localStorage.clear()
      navigate('/sign-in')
    } catch (err) {
      console.error('Logout failed', err)
    }
  }

  const handleCreateNote = async () => {
    if (!content.trim()){
      console.warn("Note content is empty");
      return;
    }
    try {
      console.log("Creating note with content:",content);
      const res=await axios.post('http://localhost:8080/api/v1/notes', {
        note:content}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }); 
      console.log("Note created:",res.data.note);    
      setApprovedBy('');
      setContent('');
      fetchNotes();
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/v1/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      fetchNotes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleUpdate = async () => {
    if (!content.trim()) {
      console.warn("Note content is empty")
      return
    }
    try {
      const res = await axios.put(`http://localhost:8080/api/v1/notes`, {
        id: editingNote.id,
        content: content,
        approved_by: approvedBy
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      console.log("Note updated:", res.data)
      setEditingNote(null)  // Reset editing state
      setContent('')
      setApprovedBy('')
      fetchNotes()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSearch = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/v1/notes/search?approved_by=${searchTerm}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      })
      setNotes(res.data.notes)
    } catch (err) {
      console.error(err)
    }
  }

  const exportPDF = () => {
    const token = localStorage.getItem('token')
    window.open(`http://localhost:8080/api/v1/notes/export/pdf?token=${token}`, '_blank')
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome, {profile.username} ({profile.email})
          </p>
        </div>
        <Button onClick={handleLogout} color="failure">Logout</Button>
      </div>

      {/* Note Input and Actions */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextInput
          placeholder="Approved By"
          value={approvedBy}
          onChange={(e) => setApprovedBy(e.target.value)}
        />
        <TextInput
          placeholder="Write a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        {editingNote ? (
          <Button onClick={handleUpdate}>Update Note</Button>
        ) : (
          <Button onClick={handleCreateNote}>Add Note</Button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-4">
        <TextInput
          placeholder="Search by Approved By..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={exportPDF} color="purple">Export PDF</Button>
      </div>

      {/* Notes Table */}
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>ID</Table.HeadCell>
          <Table.HeadCell>Approved By</Table.HeadCell>
          <Table.HeadCell>Note</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Time</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {notes.length > 0 ? notes.map(note => (
            <Table.Row key={note.id}>
              <Table.Cell>{note.id}</Table.Cell>
              <Table.Cell>{note.approved_by}</Table.Cell>
              <Table.Cell>{note.content}</Table.Cell>
              <Table.Cell>{note.date}</Table.Cell>
              <Table.Cell>{note.time}</Table.Cell>
              <Table.Cell>
                <Button size="xs" color="failure" onClick={() => handleDelete(note.id)}>Delete</Button>
                <Button size="xs" onClick={() => {
                  setEditingNote(note)
                  setContent(note.content)
                  setApprovedBy(note.approved_by)
                }}>Edit</Button>
              </Table.Cell>
            </Table.Row>
          )) : (
            <Table.Row>
              <Table.Cell colSpan="6" className="text-center">No notes available</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </div>
  )
}

export default Dashboard


  {/*
  return (
    <div className="p-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome, {profile.username} ({profile.email})
          </p>
        </div>
        <Button onClick={handleLogout} color="failure">Logout</Button>
      </div>

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <TextInput
          placeholder="Approved By"
          value={approvedBy}
          onChange={(e) => setApprovedBy(e.target.value)}
        />
        <TextInput
          placeholder="Write a note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <Button onClick={handleCreateNote}>Add Note</Button>
      </div>

      <div className="mb-4 flex gap-4">
        <TextInput
          placeholder="Search by Approved By..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleSearch}>Search</Button>
        <Button onClick={exportPDF} color="purple">Export PDF</Button>
      </div>

      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>ID</Table.HeadCell>
          <Table.HeadCell>Approved By</Table.HeadCell>
          <Table.HeadCell>Note</Table.HeadCell>
          <Table.HeadCell>Date</Table.HeadCell>
          <Table.HeadCell>Time</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {notes.map(note => (
            <Table.Row key={note.id}>
              <Table.Cell>{note.id}</Table.Cell>
              <Table.Cell>{note.approved_by}</Table.Cell>
              <Table.Cell>{note.content}</Table.Cell>
              <Table.Cell>{note.date}</Table.Cell>
              <Table.Cell>{note.time}</Table.Cell>
              <Table.Cell>
                <Button size="xs" color="failure" onClick={() => handleDelete(note.id)}>Delete</Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

export default Dashboard
*/}