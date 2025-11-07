import React from 'react';
import axios from 'axios';

export default function ProjectDetails({ projectId, token }){
  const [file, setFile] = React.useState(null);
  const onUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Choose a file');
    const fd = new FormData();
    fd.append('media', file);
    try {
      const res = await axios.post(`/api/projects/${projectId}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } });
      alert('Uploaded: ' + res.data.url);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    }
  };
  return (
    <div className="bg-white p-4 rounded shadow max-w-xl">
      <h3 className="text-xl font-bold">Project {projectId}</h3>
      <form onSubmit={onUpload} className="mt-4">
        <input type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files[0])} />
        <div className="mt-4"><button className="px-4 py-2 rounded bg-indigo-600 text-white">Upload</button></div>
      </form>
    </div>
  );
}
