
import React, { useState, useEffect, useRef } from 'react';
import { 
  Database, Server, Layout, Play, RefreshCw, Plus, Trash2, Edit2, 
  CheckCircle, AlertCircle, Code, Layers, Terminal, Search, Filter, 
  ChevronRight, ExternalLink, Activity, Cpu, HardDrive, Eye, Save, X
} from 'lucide-react';

const initialProjects = [
  {
    _id: "65f1a2b3c4d5e6f7a8b9c0d1",
    name: "E-Commerce Replatforming",
    client: "Acme Corp",
    category: "Web Development",
    status: "In Progress",
    budget: 45000,
    teamSize: 6,
    leadDeveloper: "Sarah Jenkins",
    techStack: ["React", "Node.js", "MongoDB", "Tailwind CSS"],
    createdAt: "2024-01-15T08:30:00.000Z",
    updatedAt: "2024-03-10T14:22:00.000Z"
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b9c0d2",
    name: "AI Customer Support Bot",
    client: "Global Tech Solutions",
    category: "AI/ML Integration",
    status: "Completed",
    budget: 28000,
    teamSize: 3,
    leadDeveloper: "Alex Rivera",
    techStack: ["Python", "FastAPI", "React", "Pinecone"],
    createdAt: "2023-11-01T10:15:00.000Z",
    updatedAt: "2024-02-28T09:45:00.000Z"
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b9c0d3",
    name: "Mobile Banking Companion App",
    client: "Apex Financial",
    category: "Mobile App",
    status: "In Review",
    budget: 62000,
    teamSize: 8,
    leadDeveloper: "David Chen",
    techStack: ["React Native", "Express", "MongoDB", "Redux"],
    createdAt: "2024-02-01T12:00:00.000Z",
    updatedAt: "2024-03-18T16:00:00.000Z"
  },
  {
    _id: "65f1a2b3c4d5e6f7a8b9c0d4",
    name: "Healthcare Analytics Dashboard",
    client: "MedPulse Health",
    category: "Data Visualization",
    status: "Planning",
    budget: 35000,
    teamSize: 4,
    leadDeveloper: "Emily Watson",
    techStack: ["React", "D3.js", "Express", "MongoDB"],
    createdAt: "2024-03-05T09:10:00.000Z",
    updatedAt: "2024-03-05T09:10:00.000Z"
  }
];

const mongoSchemaCode = `// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Project name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  client: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Web Development', 'Mobile App', 'AI/ML Integration', 'Data Visualization', 'Cloud Migration'],
    default: 'Web Development'
  },
  status: {
    type: String,
    enum: ['Planning', 'In Progress', 'In Review', 'Completed'],
    default: 'Planning'
  },
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: [0, 'Budget must be positive']
  },
  teamSize: {
    type: Number,
    default: 1
  },
  leadDeveloper: {
    type: String,
    required: true
  },
  techStack: [{
    type: String
  }]
}, {
  timestamps: true // Automatically creates createdAt & updatedAt
});

module.exports = mongoose.model('Project', projectSchema);`;

const expressRoutesCode = `// routes/projectRoutes.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET all projects (with filtering)
router.get('/api/projects', async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new project
router.post('/api/projects', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update project by ID
router.put('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE project by ID
router.delete('/api/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;`;

export default function App() {
  const [activeTab, setActiveTab] = useState('frontend'); // 'frontend', 'backend', 'database'
  const [dbData, setDbData] = useState(initialProjects);
  const [apiLogs, setApiLogs] = useState([]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    category: 'Web Development',
    status: 'Planning',
    budget: 10000,
    teamSize: 2,
    leadDeveloper: '',
    techStack: 'React, Express, Node.js'
  });

  const [simulatedLatency, setSimulatedLatency] = useState(120);
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [apiLogs]);

  // Log generator helper
  const addLog = (method, url, status, requestBody, responseData, duration) => {
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      method,
      url,
      status,
      requestBody,
      responseData,
      duration: duration || Math.floor(Math.random() * 40 + 80)
    };
    setApiLogs(prev => [...prev.slice(-25), newLog]);
  };

  // Simulated API Calls
  const handleFetchProjects = () => {
    const startTime = performance.now();
    let result = [...dbData];
    
    if (filterCategory !== 'All') {
      result = result.filter(p => p.category === filterCategory);
    }
    if (filterStatus !== 'All') {
      result = result.filter(p => p.status === filterStatus);
    }
    if (searchTerm) {
      result = result.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const duration = Math.round(performance.now() - startTime + simulatedLatency);
    const queryParams = new URLSearchParams();
    if (filterCategory !== 'All') queryParams.append('category', filterCategory);
    if (filterStatus !== 'All') queryParams.append('status', filterStatus);
    if (searchTerm) queryParams.append('search', searchTerm);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    addLog('GET', `/api/projects${queryString}`, 200, null, { success: true, count: result.length, data: result }, duration);
  };

  // Run fetch log on filter change
  useEffect(() => {
    handleFetchProjects();
  }, [filterCategory, filterStatus, searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      client: '',
      category: 'Web Development',
      status: 'Planning',
      budget: 15000,
      teamSize: 3,
      leadDeveloper: '',
      techStack: 'React, Node.js, MongoDB'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      client: project.client,
      category: project.category,
      status: project.status,
      budget: project.budget,
      teamSize: project.teamSize,
      leadDeveloper: project.leadDeveloper,
      techStack: project.techStack.join(', ')
    });
    setIsModalOpen(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    const startTime = performance.now();
    
    const techArray = formData.techStack
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (editingProject) {
      // UPDATE (PUT)
      const updatedItem = {
        ...editingProject,
        name: formData.name,
        client: formData.client,
        category: formData.category,
        status: formData.status,
        budget: Number(formData.budget),
        teamSize: Number(formData.teamSize),
        leadDeveloper: formData.leadDeveloper,
        techStack: techArray,
        updatedAt: new Date().toISOString()
      };

      setDbData(prev => prev.map(p => p._id === editingProject._id ? updatedItem : p));

      const duration = Math.round(performance.now() - startTime + simulatedLatency);
      addLog('PUT', `/api/projects/${editingProject._id}`, 200, formData, { success: true, data: updatedItem }, duration);
    } else {
      // CREATE (POST)
      const newHexId = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const newItem = {
        _id: newHexId,
        name: formData.name,
        client: formData.client,
        category: formData.category,
        status: formData.status,
        budget: Number(formData.budget),
        teamSize: Number(formData.teamSize),
        leadDeveloper: formData.leadDeveloper,
        techStack: techArray,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setDbData(prev => [newItem, ...prev]);

      const duration = Math.round(performance.now() - startTime + simulatedLatency);
      addLog('POST', '/api/projects', 201, formData, { success: true, data: newItem }, duration);
    }

    setIsModalOpen(false);
  };

  const handleDeleteProject = (id) => {
    const startTime = performance.now();
    setDbData(prev => prev.filter(p => p._id !== id));
    
    const duration = Math.round(performance.now() - startTime + simulatedLatency);
    addLog('DELETE', `/api/projects/${id}`, 200, null, { success: true, message: 'Resource deleted successfully' }, duration);
  };

  // Filtered view items for Frontend display
  const displayedProjects = dbData.filter(p => {
    const matchesCat = filterCategory === 'All' || p.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    const matchesSearch = !searchTerm || 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'In Progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'In Review':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-500/20">
            M
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
              MERN Stack Interactive Showcase
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                Full-Stack Architecture
              </span>
            </h1>
            <p className="text-xs text-slate-400">React • Express.js • Node.js • MongoDB • Tailwind CSS</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-950 border border-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('frontend')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'frontend'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layout className="w-4 h-4" />
            Frontend UI
          </button>
          <button
            onClick={() => setActiveTab('backend')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'backend'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Server className="w-4 h-4" />
            Backend Routes & API
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'database'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            MongoDB Collection ({dbData.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setDbData(initialProjects)} 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-lg transition"
            title="Reset DB Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Data
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Primary View Area */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          {/* TAB 1: FRONTEND REACT UI */}
          {activeTab === 'frontend' && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Dashboard Banner */}
              <div className="bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="relative z-10 flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Project Management Dashboard</h2>
                    <p className="text-sm text-slate-300">
                      Real-time interactive client interface connected directly to the simulated Express REST API and MongoDB cluster.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenCreateModal}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5"
                  >
                    <Plus className="w-4 h-4" />
                    New Project
                  </button>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by project or client..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Categories</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="AI/ML Integration">AI/ML Integration</option>
                    <option value="Data Visualization">Data Visualization</option>
                  </select>
                </div>
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Projects Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedProjects.length === 0 ? (
                  <div className="col-span-2 text-center py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
                    <p className="text-slate-400">No projects found matching the criteria.</p>
                  </div>
                ) : (
                  displayedProjects.map((project) => (
                    <div
                      key={project._id}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div>
                            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 border border-indigo-800/40 px-2 py-0.5 rounded">
                              {project.category}
                            </span>
                            <h3 className="font-bold text-lg text-slate-100 mt-1">{project.name}</h3>
                            <p className="text-xs text-slate-400">Client: <span className="text-slate-300 font-medium">{project.client}</span></p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full border ${getStatusBadge(project.status)} font-medium`}>
                            {project.status}
                          </span>
                        </div>

                        {/* Tech stack tags */}
                        <div className="flex flex-wrap gap-1.5 my-3">
                          {project.techStack.map((tech, idx) => (
                            <span key={idx} className="text-xs bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-3 gap-2 py-3 my-2 border-y border-slate-800/60 text-xs">
                          <div>
                            <span className="text-slate-500 block">Budget</span>
                            <span className="font-semibold text-emerald-400">${project.budget.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Team</span>
                            <span className="font-semibold text-slate-200">{project.teamSize} members</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Lead</span>
                            <span className="font-semibold text-slate-200 truncate block">{project.leadDeveloper}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 text-xs text-slate-500">
                        <span className="font-mono text-[10px]">ID: {project._id.substring(0, 8)}...</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditModal(project)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded transition"
                            title="Edit Project (PUT)"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project._id)}
                            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition"
                            title="Delete Project (DELETE)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BACKEND ROUTES CODE */}
          {activeTab === 'backend' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-bold">Express Router Controller (`routes/projectRoutes.js`)</h2>
                  </div>
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono">
                    REST API Middleware
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  Below is the standard Express.js route logic running behind the scenes to serve CRUD operations for our MongoDB model.
                </p>
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed">
                  <pre>{expressRoutesCode}</pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONGO DB DATABASE */}
          {activeTab === 'database' && (
            <div className="max-w-5xl mx-auto space-y-6">
              {/* Mongo Schema View */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold">Mongoose Schema Visualizer (`models/Project.js`)</h2>
                  </div>
                  <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-full font-mono">
                    MongoDB Collection Schema
                  </span>
                </div>
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 overflow-x-auto font-mono text-xs text-slate-300 leading-relaxed mb-6">
                  <pre>{mongoSchemaCode}</pre>
                </div>

                {/* Raw Document Collection JSON Inspection */}
                <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Live Collection Documents (`db.projects.find()`)
                </h3>
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96">
                  <pre>{JSON.stringify(dbData, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Live Terminal & API Inspector Sidebar */}
        <aside className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900/90 flex flex-col h-80 md:h-auto">
          <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">HTTP API Network Inspector</span>
            </div>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 font-mono text-xs">
            {apiLogs.length === 0 ? (
              <div className="text-center py-8 text-slate-600">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No requests captured yet. Interact with the UI to trigger API calls.
              </div>
            ) : (
              apiLogs.map((log) => (
                <div key={log.id} className="bg-slate-950 border border-slate-800/80 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.method === 'GET'
                          ? 'bg-blue-500/20 text-blue-400'
                          : log.method === 'POST'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.method === 'PUT'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {log.method}
                    </span>
                    <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  </div>

                  <div className="text-slate-300 truncate font-semibold" title={log.url}>
                    {log.url}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-900">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Status: {log.status}
                    </span>
                    <span className="text-slate-500">{log.duration}ms</span>
                  </div>

                  {log.requestBody && (
                    <details className="mt-1">
                      <summary className="cursor-pointer text-slate-500 hover:text-slate-400 text-[10px]">
                        Request Payload
                      </summary>
                      <pre className="mt-1 bg-slate-900 p-2 rounded text-[10px] text-slate-300 overflow-x-auto">
                        {JSON.stringify(log.requestBody, null, 2)}
                      </pre>
                    </details>
                  )}

                  <details className="mt-1">
                    <summary className="cursor-pointer text-slate-500 hover:text-slate-400 text-[10px]">
                      Response Data
                    </summary>
                    <pre className="mt-1 bg-slate-900 p-2 rounded text-[10px] text-indigo-300 overflow-x-auto">
                      {JSON.stringify(log.responseData, null, 2)}
                    </pre>
                  </details>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </aside>
      </div>

      {/* CRUD Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">
                {editingProject ? 'Edit Project (PUT Request)' : 'Create New Project (POST Request)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. NextGen Web Portal"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={formData.client}
                    onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Web Development">Web Development</option>
                    <option value="Mobile App">Mobile App</option>
                    <option value="AI/ML Integration">AI/ML Integration</option>
                    <option value="Data Visualization">Data Visualization</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    required
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Team Size</label>
                  <input
                    type="number"
                    required
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Lead Developer</label>
                <input
                  type="text"
                  required
                  value={formData.leadDeveloper}
                  onChange={(e) => setFormData({ ...formData, leadDeveloper: e.target.value })}
                  placeholder="e.g. Jane Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={formData.techStack}
                  onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                  placeholder="React, Express, MongoDB, Tailwind"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-md transition"
                >
                  <Save className="w-4 h-4" />
                  {editingProject ? 'Update Document' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
