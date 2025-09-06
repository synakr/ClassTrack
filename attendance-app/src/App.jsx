import React, { useState, useEffect, useRef } from 'react'

export default function App() {
  const [teacher, setTeacher] = useState(() => {
    try { return JSON.parse(localStorage.getItem('teacher')) || null } catch { return null }
  })
  const [view, setView] = useState(teacher ? 'classes' : 'register')

  const [classes, setClasses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('classes')) || [] } catch { return [] }
  })

  const [newClass, setNewClass] = useState({name:'', subject:'', schedule:''})
  const [activeClassId, setActiveClassId] = useState(null)

  useEffect(() => { localStorage.setItem('classes', JSON.stringify(classes)) }, [classes])
  useEffect(() => { if (teacher) localStorage.setItem('teacher', JSON.stringify(teacher)) }, [teacher])

  function handleRegister(e) {
    e.preventDefault()
    const form = new FormData(e.target)
    const payload = {
      name: form.get('name'),
      email: form.get('email')
    }
    setTeacher(payload)
    setView('classes')
  }

  function createClass() {
    if (!newClass.name) return
    const cls = { id: Date.now().toString(), name: newClass.name, subject: newClass.subject, schedule: newClass.schedule, students: [] }
    setClasses([cls, ...classes])
    setNewClass({name:'',subject:'',schedule:''})
  }

  function openClass(id) { setActiveClassId(id); setView('classDetail') }

  async function handleExcelUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const XLSX = await import('xlsx')
    const data = await file.arrayBuffer()
    const workbook = XLSX.read(data, { type: 'array' })
    const first = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(first, { header: ['enroll','name','reg'], range: 0 })
    const students = json.filter(r => r.enroll || r.name).map((r, i) => ({ enroll: String(r.enroll || i+1), name: r.name || '', reg: r.reg || '' }))

    setClasses(prev => prev.map(c => c.id === activeClassId ? ({ ...c, students }) : c))
    alert('Uploaded '+students.length+' students. Swipe to take attendance.')
  }

  const [cursor, setCursor] = useState(0)
  const [todayKey, setTodayKey] = useState(() => (new Date()).toISOString().slice(0,10))
  const touchStartX = useRef(null)

  const activeClass = classes.find(c=>c.id===activeClassId)
  const students = activeClass?.students || []

  function setAttendanceFor(enroll, present) {
    setClasses(prev => prev.map(c => {
      if (c.id !== activeClassId) return c
      const attendance = { ...(c.attendance || {}) }
      attendance[todayKey] = { ...(attendance[todayKey] || {}) , [enroll]: present }
      return { ...c, attendance }
    }))
  }

  function markPresent() {
    const s = students[cursor]
    if (!s) return
    setAttendanceFor(s.enroll, true)
    if (cursor < students.length-1) setCursor(cursor+1)
  }
  function markAbsent() {
    const s = students[cursor]
    if (!s) return
    setAttendanceFor(s.enroll, false)
    if (cursor < students.length-1) setCursor(cursor+1)
  }

  function onTouchStart(e){ touchStartX.current = e.touches?.[0]?.clientX || e.clientX }
  function onTouchEnd(e){
    const end = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : e.clientX
    const diff = end - (touchStartX.current || 0)
    if (diff > 50) markPresent()
    else if (diff < -50) markAbsent()
  }

  function exportAttendanceCSV(cls, dateKey) {
    const rows = [['Enroll','Name','Reg','Present']]
    const att = (cls.attendance || {})[dateKey] || {}
    (cls.students||[]).forEach(s => rows.push([s.enroll, s.name, s.reg, att[s.enroll] ? '1' : '0']))
    const csv = rows.map(r => r.map(cell => '"'+String(cell||'')+'"').join(',')).join('\n')
    const blob = new Blob([csv], {type:'text/csv'})
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href=url; a.download = `${cls.name || 'class'}_${dateKey}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }

  if (view === 'register') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-4">
      <form onSubmit={handleRegister} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">Teacher Registration</h2>
        <label className="block mb-3">
          <span className="text-sm text-slate-600">Full Name</span>
          <input name="name" required className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-slate-500" />
        </label>
        <label className="block mb-4">
          <span className="text-sm text-slate-600">Email</span>
          <input name="email" type="email" className="w-full p-3 border rounded-lg mt-1 focus:ring-2 focus:ring-slate-500" />
        </label>
        <button className="w-full py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition">Register</button>
      </form>
    </div>
  )

  if (view === 'classes') return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm text-slate-500">Welcome back,</p>
          <h1 className="text-xl font-bold text-slate-800">{teacher?.name}</h1>
        </div>
        <button onClick={()=>{localStorage.removeItem('teacher'); setTeacher(null); setView('register')}} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-200">Logout</button>
      </header>

      <section className="mb-8 max-w-3xl">
        <h2 className="font-semibold mb-3 text-slate-700">Create New Class</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input value={newClass.name} onChange={e=>setNewClass({...newClass, name:e.target.value})} placeholder="Class name" className="p-3 border rounded-lg" />
          <input value={newClass.subject} onChange={e=>setNewClass({...newClass, subject:e.target.value})} placeholder="Subject / Batch" className="p-3 border rounded-lg" />
          <input value={newClass.schedule} onChange={e=>setNewClass({...newClass, schedule:e.target.value})} placeholder="Schedule" className="p-3 border rounded-lg" />
        </div>
        <button onClick={createClass} className="mt-3 px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Create</button>
      </section>

      <section>
        <h2 className="font-semibold mb-4 text-slate-700">Your Classes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {classes.map(c => (
            <div key={c.id} className="p-5 bg-white rounded-xl shadow hover:shadow-md transition cursor-pointer" onClick={()=>openClass(c.id)}>
              <h3 className="font-bold text-lg text-slate-800">{c.name}</h3>
              <p className="text-sm text-slate-500">{c.subject}</p>
              <p className="text-xs text-slate-400 mt-1">{c.schedule}</p>
              <p className="text-sm text-slate-600 mt-3">👥 {(c.students||[]).length} students</p>
            </div>
          ))}
          {classes.length===0 && <div className="text-slate-500">No classes yet. Create one above.</div>}
        </div>
      </section>
    </div>
  )

  if (view === 'classDetail' && activeClass) return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800">{activeClass.name}</h1>
          <p className="text-sm text-slate-500">{activeClass.subject} — {activeClass.schedule}</p>
        </div>
        <button onClick={()=>setView('classes')} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-200">← Back</button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold text-slate-700 mb-4">Take Attendance</h2>
          <p className="text-sm text-slate-500 mb-3">Upload Excel with columns: enrollment no | name | registration number</p>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelUpload} className="mb-4" />

          {students.length>0 ? (
            <div>
              <div
                onTouchStart={onTouchStart}
                onMouseDown={onTouchStart}
                onTouchEnd={onTouchEnd}
                onMouseUp={onTouchEnd}
                className="bg-slate-50 p-8 rounded-xl shadow-inner text-center mb-4 select-none"
              >
                <p className="text-sm text-slate-500 mb-2">{cursor+1} / {students.length}</p>
                <h3 className="text-2xl font-bold text-slate-800">{students[cursor]?.name}</h3>
                <p className="text-sm text-slate-500 mt-1">Enroll: {students[cursor]?.enroll} • Reg: {students[cursor]?.reg}</p>
              </div>

              <div className="flex gap-3">
                <button onClick={markAbsent} className="flex-1 py-3 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200">❌ Absent</button>
                <button onClick={markPresent} className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-500">✅ Present</button>
              </div>

              <p className="mt-3 text-sm text-slate-500">Date: {todayKey}</p>
            </div>
          ) : (
            <p className="text-slate-500">No students yet. Upload an Excel file.</p>
          )}
        </div>

        <aside className="bg-white p-6 rounded-xl shadow">
          <h2 className="font-semibold text-slate-700 mb-4">Class Utilities</h2>
          <p className="mb-3 text-slate-600">👥 Students: {(activeClass.students||[]).length}</p>
          <button onClick={()=>exportAttendanceCSV(activeClass,todayKey)} className="w-full py-2 border rounded-lg hover:bg-slate-100">Export CSV (Today)</button>
          <div className="mt-6 text-sm text-slate-500">
            <p>Later you can add Internal Marks, Reports, Analytics here.</p>
          </div>
        </aside>
      </div>
    </div>
  )

  return <div />
}
