import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, Folder, Tag } from 'lucide-react';
import Button from '../ui/Button';

const GroupManagementModal = ({ isOpen, onClose, devices, onGroupsUpdated }) => {
  const [groups, setGroups] = useState([]);
  const [editingGroup, setEditingGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupColor, setNewGroupColor] = useState('#3b82f6');
  const [selectedCameras, setSelectedCameras] = useState([]);
  const [loading, setLoading] = useState(false);

  const colors = [
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#10b981' },
    { name: 'Cyan', value: '#06b6d4' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen]);

  const loadGroups = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/groups');
      const data = await response.json();
      
      if (data.success) {
        setGroups(data.groups);
      }
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          color: newGroupColor,
          cameras: selectedCameras
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setGroups([...groups, data.group]);
        setNewGroupName('');
        setSelectedCameras([]);
        onGroupsUpdated?.();
      }
    } catch (error) {
      console.error('Failed to create group:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGroup = async (groupId, updates) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/groups/${groupId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const data = await response.json();
      
      if (data.success) {
        setGroups(groups.map(g => g.id === groupId ? data.group : g));
        setEditingGroup(null);
        onGroupsUpdated?.();
      }
    } catch (error) {
      console.error('Failed to update group:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteGroup = async (groupId) => {
    if (!confirm('Are you sure you want to delete this group?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/groups/${groupId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        setGroups(groups.filter(g => g.id !== groupId));
        onGroupsUpdated?.();
      }
    } catch (error) {
      console.error('Failed to delete group:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCameraInGroup = (groupId, cameraId) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const cameras = group.cameras || [];
    const newCameras = cameras.includes(cameraId)
      ? cameras.filter(c => c !== cameraId)
      : [...cameras, cameraId];

    updateGroup(groupId, { cameras: newCameras });
  };

  const getCameraCount = (group) => {
    return group.cameras?.length || 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-bg-secondary rounded-xl shadow-2xl border border-cyan-500/20 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Folder className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Group Management</h2>
              <p className="text-sm text-text-secondary">Organize cameras by room or location</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Create New Group */}
          <div className="p-4 bg-bg-tertiary rounded-lg border border-gray-700">
            <h3 className="font-semibold text-text-primary mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-cyan-400" />
              Create New Group
            </h3>

            <div className="space-y-4">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Group name (e.g., Living Room, Front Yard)"
                  className="flex-1 px-4 py-2 bg-bg-secondary border border-gray-700 rounded-lg text-text-primary focus:border-cyan-500 focus:outline-none"
                />
                <Button onClick={createGroup} disabled={loading || !newGroupName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Color:</span>
                {colors.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewGroupColor(color.value)}
                    className={`w-8 h-8 rounded-full transition-all ${
                      newGroupColor === color.value ? 'ring-2 ring-white scale-110' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>

              <div>
                <span className="text-sm text-text-secondary block mb-2">Assign Cameras:</span>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {devices.map((device) => {
                    const deviceId = device.ip_address || device.name;
                    const isSelected = selectedCameras.includes(deviceId);
                    
                    return (
                      <label
                        key={deviceId}
                        className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            if (isSelected) {
                              setSelectedCameras(selectedCameras.filter(c => c !== deviceId));
                            } else {
                              setSelectedCameras([...selectedCameras, deviceId]);
                            }
                          }}
                          className="w-4 h-4 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                        />
                        <span className="text-sm text-text-primary truncate">
                          {device.device_name || device.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Existing Groups */}
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-400" />
              Existing Groups ({groups.length})
            </h3>

            {groups.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <Folder className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No groups created yet</p>
                <p className="text-sm mt-2">Create a group to organize your cameras</p>
              </div>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <motion.div
                    key={group.id}
                    layout
                    className="p-4 bg-bg-tertiary rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: group.color }}
                        />
                        {editingGroup === group.id ? (
                          <input
                            type="text"
                            defaultValue={group.name}
                            onBlur={(e) => {
                              if (e.target.value.trim()) {
                                updateGroup(group.id, { name: e.target.value.trim() });
                              }
                            }}
                            className="flex-1 px-3 py-1 bg-bg-secondary border border-gray-600 rounded text-text-primary focus:border-cyan-500 focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <div className="flex-1">
                            <h4 className="font-semibold text-text-primary">{group.name}</h4>
                            <p className="text-sm text-text-secondary">
                              {getCameraCount(group)} camera{getCameraCount(group) !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingGroup(editingGroup === group.id ? null : group.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => deleteGroup(group.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>

                    {/* Camera List */}
                    <div className="grid grid-cols-2 gap-2 pl-7">
                      {devices.map((device) => {
                        const deviceId = device.ip_address || device.name;
                        const isInGroup = group.cameras?.includes(deviceId);
                        
                        return (
                          <label
                            key={deviceId}
                            className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isInGroup}
                              onChange={() => toggleCameraInGroup(group.id, deviceId)}
                              className="w-3 h-3 text-cyan-500 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                            />
                            <span className="text-xs text-text-primary truncate">
                              {device.device_name || device.name}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <Button onClick={onClose}>
            Done
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default GroupManagementModal;
