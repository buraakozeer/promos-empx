import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, CheckCircle, Clock, AlertCircle, 
  Plus, X, Paperclip, MessageSquare, Edit, FileText, ChevronRight, Save, Upload, Trash2, File, Repeat, List, Eye 
} from 'lucide-react';

export default function TaskManagement({ authToken }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');
  const [personFilter, setPersonFilter] = useState('all');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [detailDescription, setDetailDescription] = useState("");

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    endDate: "",
    assignedTo: [],
    subDetails: {},
    attachment: null,
    isRecurring: false,
    recurrenceType: 'daily',
    recurrenceCount: 2
  });

  const [extensionForm, setExtensionForm] = useState({ date: "", reason: "" });
  const [newNote, setNewNote] = useState("");

  const apiFetch = async (path, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    };
    const res = await fetch(`http://localhost:4000/api${path}`, {
      ...options,
      headers,
    });
    return res;
  };

  useEffect(() => {
    if (authToken) {
      fetchCurrentUser();
      fetchAllUsers();
      fetchTasks();
    }
  }, [authToken]);

  const fetchCurrentUser = async () => {
    try {
      const res = await apiFetch('/users/me');
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      }
    } catch (err) {
      console.error('Current user fetch error:', err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await apiFetch('/users/list');
      if (res.ok) {
        const users = await res.json();
        setAllUsers(users);
      }
    } catch (err) {
      console.error('Users fetch error:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await apiFetch('/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (err) {
      console.error('Tasks fetch error:', err);
    }
  };

  const getVisibleTasks = () => {
    let visible = tasks;
    
    if (currentUser?.role !== 'admin') {
      visible = tasks.filter(t => 
        t.assignedTo.includes(currentUser?.id) || t.createdBy === currentUser?.id
      );
    } else {
      if (personFilter !== 'all') {
        visible = visible.filter(t => t.assignedTo.includes(personFilter));
      }
    }

    if (filterStatus) {
      if (filterStatus === 'extension_needed') {
        visible = visible.filter(t => t.extensionRequest && t.extensionRequest.status === 'pending');
      } else {
        visible = visible.filter(t => t.status === filterStatus);
      }
    }

    const today = new Date().toISOString().split('T')[0];

    if (timeFilter === 'daily') {
      visible = visible.filter(t => t.dueDate === today);
    } else if (timeFilter === 'weekly') {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];
      visible = visible.filter(t => t.dueDate >= today && t.dueDate <= nextWeekStr);
    }

    return visible;
  };

  const getStats = () => {
    let baseTasks = tasks;
    
    if (currentUser?.role !== 'admin') {
      baseTasks = tasks.filter(t => t.assignedTo.includes(currentUser?.id));
    } else {
      if (personFilter !== 'all') {
         baseTasks = baseTasks.filter(t => t.assignedTo.includes(personFilter));
      }
    }

    return {
      pending: baseTasks.filter(t => t.status === 'pending').length,
      completed: baseTasks.filter(t => t.status === 'completed').length,
      extension: baseTasks.filter(t => t.extensionRequest && t.extensionRequest.status === 'pending').length,
      total: baseTasks.length
    };
  };

  const getUserName = (id) => {
    const user = allUsers.find(u => u.id === id);
    return user ? `${user.name} ${user.surname}` : "Bilinmeyen";
  };

  const getUserAvatar = (id) => {
    const user = allUsers.find(u => u.id === id);
    if (!user) return "?";
    return `${user.name.charAt(0)}${user.surname.charAt(0)}`;
  };

  const openCreateModal = () => {
    setEditingTaskId(null);
    const today = new Date().toISOString().split('T')[0];
    setTaskForm({
      title: "",
      description: "",
      dueDate: today,
      endDate: "",
      assignedTo: [],
      subDetails: {},
      attachment: null,
      isRecurring: false,
      recurrenceType: 'daily',
      recurrenceCount: 2
    });
    setIsCreateModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    const subDetails = {};
    task.subTasks.forEach(st => subDetails[st.userId] = st.detail);
    
    setTaskForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      endDate: task.endDate || "",
      assignedTo: task.assignedTo,
      subDetails: subDetails,
      attachment: task.attachment,
      isRecurring: false,
      recurrenceType: 'daily',
      recurrenceCount: 1
    });
    setIsDetailModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTaskForm({
        ...taskForm,
        attachment: {
          name: file.name,
          type: file.type,
          url: url,
          isMock: false
        }
      });
    }
  };

  const handleRemoveFile = () => {
    setTaskForm({ ...taskForm, attachment: null });
  };

  const handleSaveTask = async () => {
    if (!taskForm.title || taskForm.assignedTo.length === 0 || !taskForm.dueDate) return;

    const subTasks = taskForm.assignedTo.map(id => ({ 
      userId: id, 
      detail: taskForm.subDetails[id] || "Genel Görev" 
    }));

    try {
      if (editingTaskId) {
        const res = await apiFetch(`/tasks/${editingTaskId}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: taskForm.title,
            description: taskForm.description,
            dueDate: taskForm.dueDate,
            endDate: taskForm.endDate,
            assignedTo: taskForm.assignedTo,
            subTasks: subTasks,
            attachment: taskForm.attachment
          })
        });
        if (res.ok) {
          await fetchTasks();
        }
      } else {
        const res = await apiFetch('/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: taskForm.title,
            description: taskForm.description,
            dueDate: taskForm.dueDate,
            endDate: taskForm.endDate,
            assignedTo: taskForm.assignedTo,
            subTasks: subTasks,
            attachment: taskForm.attachment,
            isRecurring: taskForm.isRecurring,
            recurrenceType: taskForm.recurrenceType,
            recurrenceCount: taskForm.recurrenceCount
          })
        });
        if (res.ok) {
          await fetchTasks();
        }
      }
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error('Save task error:', err);
    }
  };

  const handleTaskClick = async (task) => {
    try {
      await apiFetch(`/tasks/${task.id}/read`, { method: 'PUT' });
      const res = await apiFetch(`/tasks/${task.id}`);
      if (res.ok) {
        const fullTask = await res.json();
        setSelectedTask(fullTask);
        setDetailDescription(fullTask.description);
        setIsDetailModalOpen(true);
        setNewNote("");
      }
    } catch (err) {
      console.error('Task click error:', err);
    }
  };

  const handleUpdateDescription = async () => {
    if (!selectedTask) return;
    
    try {
      const res = await apiFetch(`/tasks/${selectedTask.id}`, {
        method: 'PUT',
        body: JSON.stringify({ description: detailDescription })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedTask(updated);
        await fetchTasks();
      }
    } catch (err) {
      console.error('Update description error:', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedTask) return;
    
    try {
      const res = await apiFetch(`/tasks/${selectedTask.id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ text: newNote })
      });
      if (res.ok) {
        const note = await res.json();
        setSelectedTask({
          ...selectedTask,
          notes: [...selectedTask.notes, note]
        });
        setNewNote("");
        await fetchTasks();
      }
    } catch (err) {
      console.error('Add note error:', err);
    }
  };

  const toggleAssignee = (userId) => {
    const currentAssignees = taskForm.assignedTo;
    if (currentAssignees.includes(userId)) {
      setTaskForm({ ...taskForm, assignedTo: currentAssignees.filter(id => id !== userId) });
    } else {
      setTaskForm({ ...taskForm, assignedTo: [...currentAssignees, userId] });
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const res = await apiFetch(`/tasks/${taskId}/complete`, { method: 'PUT' });
      if (res.ok) {
        await fetchTasks();
        setIsDetailModalOpen(false);
      }
    } catch (err) {
      console.error('Complete task error:', err);
    }
  };

  const handleRequestExtension = async () => {
    if (!extensionForm.date || !extensionForm.reason) return;
    
    try {
      const res = await apiFetch(`/tasks/${selectedTask.id}/extension`, {
        method: 'POST',
        body: JSON.stringify({
          requestedDate: extensionForm.date,
          reason: extensionForm.reason
        })
      });
      if (res.ok) {
        await fetchTasks();
        setIsDetailModalOpen(false);
        setExtensionForm({ date: "", reason: "" });
      }
    } catch (err) {
      console.error('Request extension error:', err);
    }
  };

  const handleAdminExtensionDecision = async (taskId, decision, newDate = null) => {
    try {
      const res = await apiFetch(`/tasks/${taskId}/extension`, {
        method: 'PUT',
        body: JSON.stringify({ decision, newDate })
      });
      if (res.ok) {
        await fetchTasks();
        setIsDetailModalOpen(false);
      }
    } catch (err) {
      console.error('Extension decision error:', err);
    }
  };

  const handleViewAttachment = (att) => {
    if (att.isMock) {
      alert("Bu bir örnek veridir. Gerçek dosya sunucuda bulunmadığı için görüntülenemez.");
      return;
    }
    window.open(att.url, '_blank');
  };

  const handleDownloadAttachment = (att) => {
    if (att.isMock) {
      alert("Bu bir örnek veridir. Gerçek dosya sunucuda bulunmadığı için indirilemez.");
      return;
    }
    const link = document.createElement('a');
    link.href = att.url;
    link.download = att.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) {
    return <div className="p-8 text-center">Yükleniyor...</div>;
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800">
      <main className="max-w-7xl mx-auto px-4 py-6">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBox label="Toplam" count={stats.total} icon={<Users className="text-blue-600" />} isActive={filterStatus === null} onClick={() => setFilterStatus(null)} />
          <StatBox label="Bekleyen" count={stats.pending} icon={<Clock className="text-yellow-600" />} isActive={filterStatus === 'pending'} onClick={() => setFilterStatus(filterStatus === 'pending' ? null : 'pending')} />
          <StatBox label="Tamamlanan" count={stats.completed} icon={<CheckCircle className="text-green-600" />} isActive={filterStatus === 'completed'} onClick={() => setFilterStatus(filterStatus === 'completed' ? null : 'completed')} />
          <StatBox label="Talep Var" count={stats.extension} icon={<AlertCircle className="text-red-600" />} isActive={filterStatus === 'extension_needed'} onClick={() => setFilterStatus(filterStatus === 'extension_needed' ? null : 'extension_needed')} isAlert={stats.extension > 0} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 bg-white p-3 rounded-t-lg border-b border-gray-200 gap-3">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="font-bold text-gray-700 flex items-center gap-2">
              <List size={18} /> Görev Listesi
              {filterStatus && <span className="text-xs font-normal bg-gray-200 px-2 py-0.5 rounded flex items-center cursor-pointer" onClick={() => setFilterStatus(null)}>Filtreyi Kaldır <X size={10} className="ml-1"/></span>}
            </h2>

            {currentUser.role === 'admin' && (
              <select 
                className="bg-gray-100 text-xs font-medium border-none rounded-md px-3 py-1.5 cursor-pointer outline-none focus:ring-2 focus:ring-blue-200"
                value={personFilter}
                onChange={(e) => setPersonFilter(e.target.value)}
              >
                <option value="all">Tüm Ekip</option>
                {allUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name} {u.surname}</option>
                ))}
              </select>
            )}

            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
               <button 
                 onClick={() => setTimeFilter('all')}
                 className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Tümü
               </button>
               <button 
                 onClick={() => setTimeFilter('daily')}
                 className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Günlük
               </button>
               <button 
                 onClick={() => setTimeFilter('weekly')}
                 className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${timeFilter === 'weekly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
               >
                 Haftalık
               </button>
            </div>
          </div>

          <button onClick={openCreateModal} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium flex items-center justify-center gap-1 shadow-sm">
            <Plus size={16} /> Yeni Görev
          </button>
        </div>

        <div className="bg-white rounded-b-lg shadow overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th scope="col" className="px-4 py-3 border-r w-10 text-center">#</th>
                <th scope="col" className="px-4 py-3 border-r">Görev Başlığı</th>
                <th scope="col" className="px-4 py-3 border-r">Atanan Kişiler</th>
                <th scope="col" className="px-4 py-3 border-r w-32">Atama Tarihi</th>
                <th scope="col" className="px-4 py-3 border-r w-32">Son Tarih</th>
                <th scope="col" className="px-4 py-3 border-r w-32 text-center">Durum</th>
                <th scope="col" className="px-4 py-3 w-16 text-center">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {getVisibleTasks().length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-12 text-center text-gray-500">
                   <div className="flex flex-col items-center gap-2">
                     <Calendar size={32} className="text-gray-300"/>
                     <span>Bu filtreye uygun kayıt bulunamadı.</span>
                   </div>
                </td></tr>
              ) : (
                getVisibleTasks().map((task, index) => {
                  const completionPercentage = Math.round((task.completedBy?.length || 0) / task.assignedTo.length * 100);
                  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
                  const hasUnreadNotes = task.notes.length > 0 && !task.readBy.includes(currentUser.id);
                  const hasPendingExtension = task.extensionRequest && task.extensionRequest.status === 'pending';
                  
                  return (
                    <tr 
                      key={task.id} 
                      onClick={() => handleTaskClick(task)}
                      className={`bg-white border-b hover:bg-blue-50 cursor-pointer transition-colors group ${hasUnreadNotes ? 'bg-red-50' : ''}`}
                    >
                      <td className="px-4 py-3 border-r text-center text-gray-500 font-mono relative">
                        {index + 1}
                        {hasUnreadNotes && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                        {hasPendingExtension && currentUser.role === 'admin' && (
                            <span className="absolute bottom-1 right-1 text-orange-500" title="Erteleme Talebi"><Clock size={12}/></span>
                        )}
                      </td>
                      <td className="px-4 py-3 border-r font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          {task.title}
                          {task.attachment && <Paperclip size={14} className="text-blue-500 rotate-45" />}
                          {hasUnreadNotes ? (
                            <div className="flex items-center text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded-full">
                              <MessageSquare size={12} className="mr-1"/> Yeni Not
                            </div>
                          ) : (
                            task.notes.length > 0 && <div className="flex items-center text-xs text-gray-400"><MessageSquare size={12} className="mr-0.5"/> {task.notes.length}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r">
                        <div className="flex -space-x-2 overflow-hidden">
                          {task.assignedTo.map(uid => {
                            const isDone = task.completedBy.includes(uid);
                            return (
                              <div key={uid} className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-white ${isDone ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`} title={getUserName(uid)}>
                                {getUserAvatar(uid)}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 border-r text-gray-600">{task.createdAt}</td>
                      <td className={`px-4 py-3 border-r font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                        {task.dueDate}
                      </td>
                      <td className="px-4 py-3 border-r text-center">
                        {task.status === 'completed' ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded border border-green-200">Tamamlandı</span>
                        ) : (
                          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400 group-hover:text-blue-500">
                        <ChevronRight size={16} className="mx-auto"/>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 rounded-t-lg">
              <h3 className="font-bold text-gray-800">{editingTaskId ? "Görevi Düzenle" : "Yeni Görev Oluştur"}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-red-500"><X /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Görev Başlığı</label>
                  <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Açıklama</label>
                  <textarea rows="3" className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Başlangıç Tarihi</label>
                  <input type="date" className="w-full border p-2 rounded" value={taskForm.dueDate} onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Son Tarih</label>
                  <input type="date" className="w-full border p-2 rounded" value={taskForm.endDate} onChange={(e) => setTaskForm({...taskForm, endDate: e.target.value})} min={taskForm.dueDate} />
                </div>

                {!editingTaskId && (
                  <div className="col-span-1 pt-6 pl-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                        checked={taskForm.isRecurring} 
                        onChange={(e) => setTaskForm({...taskForm, isRecurring: e.target.checked})} 
                      />
                      <span className="flex items-center gap-1"><Repeat size={14}/> Bu görevi tekrarla</span>
                    </label>
                  </div>
                )}
                
                {taskForm.isRecurring && !editingTaskId && (
                  <div className="col-span-2 bg-indigo-50 border border-indigo-100 rounded-lg p-3 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-indigo-800 mb-1">Tekrar Sıklığı</label>
                      <select 
                        className="w-full border rounded p-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        value={taskForm.recurrenceType}
                        onChange={(e) => setTaskForm({...taskForm, recurrenceType: e.target.value})}
                      >
                        <option value="daily">Günlük (Her Gün)</option>
                        <option value="weekly">Haftalık (Her Hafta)</option>
                        <option value="monthly">Aylık (Her Ay)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-indigo-800 mb-1">Toplam Tekrar Sayısı</label>
                      <input 
                        type="number" 
                        min="2" 
                        max="365"
                        className="w-full border rounded p-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
                        value={taskForm.recurrenceCount}
                        onChange={(e) => setTaskForm({...taskForm, recurrenceCount: e.target.value})}
                      />
                      <p className="text-[10px] text-indigo-600 mt-1">İlk tarih dahil toplam {taskForm.recurrenceCount} görev oluşacak.</p>
                    </div>
                  </div>
                )}
                
                <div className="col-span-2 border-t pt-4 mt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dosya Ekle</label>
                  <div className="flex items-center gap-4">
                    <label htmlFor="file-upload" className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors text-sm">
                      <Upload size={16} /> Dosya Seç
                      <input 
                        id="file-upload" 
                        type="file" 
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                    <span className="text-xs text-gray-500">(PDF, JPG, PNG, Word, Excel)</span>
                  </div>
                  
                  {taskForm.attachment && (
                    <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-2 flex justify-between items-center w-full max-w-md">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="bg-blue-100 p-1.5 rounded text-blue-600"><FileText size={18}/></div>
                        <span className="text-sm text-blue-800 font-medium truncate">{taskForm.attachment.name}</span>
                      </div>
                      <button onClick={handleRemoveFile} className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="col-span-2 pt-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Atanan Kişiler</label>
                  <div className="flex flex-wrap gap-2">
                    {allUsers.map(u => (
                      <button key={u.id} onClick={() => toggleAssignee(u.id)} className={`px-3 py-1.5 rounded text-sm border flex items-center gap-2 ${taskForm.assignedTo.includes(u.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                        {u.name} {u.surname} {taskForm.assignedTo.includes(u.id) && <CheckCircle size={14}/>}
                      </button>
                    ))}
                  </div>
                </div>
                {taskForm.assignedTo.length > 0 && (
                  <div className="col-span-2 bg-gray-50 p-4 rounded border">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Kişiye Özel Açıklamalar</h4>
                    {taskForm.assignedTo.map(uid => (
                      <div key={uid} className="mb-2 flex items-center gap-2">
                        <span className="text-sm font-medium w-24 truncate">{getUserName(uid)}:</span>
                        <input type="text" className="flex-1 border p-1.5 rounded text-sm" placeholder="Özel not..." value={taskForm.subDetails[uid] || ""} onChange={(e) => setTaskForm({...taskForm, subDetails: {...taskForm.subDetails, [uid]: e.target.value}})} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50 text-right rounded-b-lg">
              <button onClick={handleSaveTask} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium shadow-sm">Kaydet</button>
            </div>
          </div>
        </div>
      )}

      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            
            <div className="flex justify-between items-start p-6 border-b">
              <div>
                <div className="flex items-center gap-2 mb-1">
                   {selectedTask.status === 'completed' 
                      ? <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded font-bold border border-green-200">TAMAMLANDI</span>
                      : <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-bold border border-blue-200">DEVAM EDİYOR</span>
                   }
                   <span className="text-gray-400 text-xs">#{selectedTask.id}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  {selectedTask.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <button onClick={() => openEditModal(selectedTask)} className="text-gray-500 hover:text-blue-600 p-2 rounded hover:bg-gray-100" title="Düzenle">
                    <Edit size={20} />
                  </button>
                )}
                <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2"><X size={24} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-6">
                
                <div className="col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1">
                      <FileText size={16}/> 
                      Açıklama 
                      {currentUser.role === 'admin' && <span className="text-xs font-normal text-gray-500 ml-2">(Düzenlenebilir)</span>}
                    </h4>
                    
                    {currentUser.role === 'admin' ? (
                      <div>
                        <textarea 
                          className="w-full bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 min-h-[80px] focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          value={detailDescription}
                          onChange={(e) => setDetailDescription(e.target.value)}
                        />
                        {detailDescription !== selectedTask.description && (
                          <button 
                            onClick={handleUpdateDescription}
                            className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded flex items-center gap-1 transition-all"
                          >
                            <Save size={12} /> Açıklamayı Güncelle
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg border text-sm text-gray-700 min-h-[80px]">
                        {selectedTask.description}
                      </div>
                    )}
                  </div>

                  {selectedTask.attachment && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-sm text-blue-600">
                           <File size={24} />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-gray-800">{selectedTask.attachment.name}</p>
                           <p className="text-xs text-gray-500 uppercase">{selectedTask.attachment.type?.split('/')[1] || 'DOSYA'} Dosyası</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewAttachment(selectedTask.attachment)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-white px-3 py-1.5 rounded border border-blue-200 hover:border-blue-400 transition-colors flex items-center gap-1"
                        >
                          <Eye size={14} /> Görüntüle
                        </button>
                        <button 
                          onClick={() => handleDownloadAttachment(selectedTask.attachment)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-bold bg-white px-3 py-1.5 rounded border border-blue-200 hover:border-blue-400 transition-colors"
                        >
                          İndir
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedTask.subTasks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Alt Görevler</h4>
                      <div className="bg-white border rounded-lg overflow-hidden">
                        {selectedTask.subTasks.map((st, idx) => (
                          <div key={idx} className="p-3 border-b last:border-0 flex justify-between items-center text-sm">
                            <span className="font-medium text-gray-700">{getUserName(st.userId)}</span>
                            <span className="text-gray-600">{st.detail}</span>
                            {selectedTask.completedBy.includes(st.userId) 
                              ? <CheckCircle size={16} className="text-green-500" />
                              : <span className="w-4 h-4 rounded-full border border-gray-300"></span>
                            }
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-1"><MessageSquare size={16}/> Notlar & Açıklamalar</h4>
                    <div className="space-y-3 mb-3 max-h-40 overflow-y-auto pr-2">
                      {selectedTask.notes.length === 0 && <p className="text-xs text-gray-400 italic">Henüz not eklenmemiş.</p>}
                      {selectedTask.notes.map(note => (
                        <div key={note.id} className="bg-yellow-50 p-2 rounded border border-yellow-100 text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs text-yellow-800">{getUserName(note.userId)}</span>
                            <span className="text-[10px] text-gray-400">{note.date}</span>
                          </div>
                          <p className="text-gray-700">{note.text}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
                        placeholder="Bir açıklama veya not ekleyin..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                      />
                      <button onClick={handleAddNote} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Ekle</button>
                    </div>
                  </div>
                </div>

                <div className="col-span-1 space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="block text-gray-500 text-xs uppercase">Son Tarih</span>
                        <span className="font-medium text-gray-800">{selectedTask.dueDate}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs uppercase">Oluşturulma</span>
                        <span className="font-medium text-gray-800">{selectedTask.createdAt}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500 text-xs uppercase">Oluşturan</span>
                        <span className="font-medium text-gray-800">{getUserName(selectedTask.createdBy)}</span>
                      </div>
                    </div>
                  </div>

                  {currentUser.role === 'admin' && selectedTask.extensionRequest?.status === 'pending' && (
                    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4 shadow-sm">
                        <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                          <AlertCircle size={16}/> Erteleme Talebi
                        </h4>
                        
                        <div className="space-y-3 text-sm">
                            <div className="bg-white p-2 rounded border border-orange-100">
                                <p className="text-xs text-gray-500 font-semibold uppercase">Sebep</p>
                                <p className="text-gray-800 italic">"{selectedTask.extensionRequest.reason}"</p>
                            </div>
                            
                            <div className="bg-white p-2 rounded border border-orange-100">
                                <p className="text-xs text-gray-500 font-semibold uppercase">İstenen Tarih</p>
                                <p className="text-gray-800">{selectedTask.extensionRequest.requestedDate}</p>
                            </div>

                            <div className="pt-2">
                                <label className="block text-xs font-bold text-gray-700 mb-1">Onay Tarihi (Düzenlenebilir)</label>
                                <input 
                                  type="date" 
                                  className="w-full border border-gray-300 rounded p-1.5 text-sm mb-3 focus:ring-2 focus:ring-orange-500 outline-none" 
                                  value={extensionForm.date || selectedTask.extensionRequest.requestedDate} 
                                  onChange={(e) => setExtensionForm({...extensionForm, date: e.target.value})} 
                                />
                                
                                <div className="grid grid-cols-2 gap-2">
                                   <button 
                                     onClick={() => handleAdminExtensionDecision(selectedTask.id, 'rejected')} 
                                     className="bg-white border border-red-300 text-red-600 hover:bg-red-50 py-2 rounded text-xs font-bold transition-colors"
                                   >
                                     Reddet
                                   </button>
                                   <button 
                                     onClick={() => handleAdminExtensionDecision(selectedTask.id, 'approved', extensionForm.date || selectedTask.extensionRequest.requestedDate)} 
                                     className="bg-green-600 hover:bg-green-700 text-white py-2 rounded text-xs font-bold transition-colors"
                                   >
                                     Kabul Et
                                   </button>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}

                  {selectedTask.assignedTo.includes(currentUser.id) && selectedTask.status !== 'completed' && !selectedTask.completedBy.includes(currentUser.id) && (
                    <div className="space-y-2">
                       <button onClick={() => handleCompleteTask(selectedTask.id)} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-medium shadow-sm flex justify-center items-center gap-2">
                         <CheckCircle size={18}/> Görevimi Tamamla
                       </button>
                       
                       <div className="pt-2 border-t">
                         <p className="text-xs text-gray-500 mb-2">Ek süreye mi ihtiyacın var?</p>
                           {!selectedTask.extensionRequest ? (
                             <>
                               <input type="date" className="w-full border rounded p-1.5 text-sm mb-2" value={extensionForm.date} onChange={(e) => setExtensionForm({...extensionForm, date: e.target.value})} />
                               <input type="text" placeholder="Sebep..." className="w-full border rounded p-1.5 text-sm mb-2" value={extensionForm.reason} onChange={(e) => setExtensionForm({...extensionForm, reason: e.target.value})} />
                               <button onClick={handleRequestExtension} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-1.5 rounded text-sm">Erteleme İste</button>
                             </>
                           ) : (
                             <div className="bg-yellow-50 p-2 rounded text-xs text-yellow-800 border border-yellow-200">
                               Talebiniz inceleniyor... ({selectedTask.extensionRequest.status === 'pending' ? 'Beklemede' : 'Sonuçlandı'})
                             </div>
                           )
                         }
                       </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, count, icon, isActive, onClick, isAlert }) {
  return (
    <div onClick={onClick} className={`bg-white p-4 rounded-lg shadow border cursor-pointer transition-all ${isActive ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 hover:border-blue-300'}`}>
      <div className="flex justify-between items-center mb-1">
        <span className="text-gray-500 text-xs font-semibold uppercase">{label}</span>
        {isAlert && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
      </div>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-2xl font-bold text-gray-800">{count}</span>
      </div>
    </div>
  );
}
