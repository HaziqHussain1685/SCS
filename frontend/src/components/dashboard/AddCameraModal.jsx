// React core
import React, { useState } from 'react';

// Animation library for modal transitions
import { motion, AnimatePresence } from 'framer-motion';

// Icon imports
import { X, Camera, Plus, AlertCircle } from 'lucide-react';

// UI components
import Card from '../ui/Card';  // Container component
import Button from '../ui/Button';  // Form buttons

/**
 * AddCameraModal - Simplified manual camera addition interface
 * User only provides name and IP - all other attributes randomly generated
 * This creates realistic demo data without overwhelming user with fields
 * 
 * @param {boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onAddCamera - Callback with new camera object
 */
const AddCameraModal = ({ isOpen, onClose, onAddCamera }) => {
  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    name: '',  // User-provided camera name
    ip: ''  // User-provided IP address
  });

  const [errors, setErrors] = useState({});  // Form validation errors

  // ===== RANDOM DATA POOLS =====
  // These arrays are used to randomly generate realistic camera attributes
  
  // Real camera model names from popular manufacturers
  const cameraModels = [
    'Hikvision DS-2CD2042WD',
    'Dahua IPC-HFW4431R',
    'TP-Link Tapo C200',
    'Reolink RLC-410',
    'Amcrest ProHD',
    'Axis M3045-V',
    'Foscam R2',
    'Nest Cam IQ',
    'Ring Stick Up Cam',
    'Wyze Cam v3'
  ];

  // Various firmware versions (mix of old and new)
  const firmwareVersions = [
    '1.0.0', '1.2.3', '2.0.1', '2.3.5', '3.1.0', '3.4.2', '4.0.0', '5.2.1'
  ];

  // Common camera HTTP/RTSP ports
  const commonPorts = [80, 8080, 8081, 8000, 8888, 554, 9000];

  // Commonly used weak credentials (for vulnerability demonstration)
  const weakCredentials = [
    { username: 'admin', password: 'admin' },  // Most common default
    { username: 'admin', password: '12345' },
    { username: 'admin', password: 'password' },
    { username: 'root', password: 'root' },
    { username: 'user', password: 'user' },
    { username: 'admin', password: '' },  // Empty password
    { username: 'guest', password: 'guest' }
  ];

  // Pre-defined security profiles with different risk levels
  // Randomly assigned to create variety in demo cameras
  const securityProfiles = [
    {
      id: 'vulnerable',
      name: 'Vulnerable (Weak Security)',
      description: 'Weak credentials, outdated firmware, multiple open ports',
      healthScore: 35,  // Low security score
      color: 'text-red-500'  // Red for critical
    },
    {
      id: 'moderate',
      name: 'Moderate (Some Issues)',
      description: 'Default credentials, some insecure services',
      healthScore: 55,  // Medium-low score
      color: 'text-orange-500'  // Orange for high risk
    },
    {
      id: 'good',
      name: 'Good (Minor Issues)',
      description: 'Strong password, minor configuration issues',
      healthScore: 75,  // Medium-high score
      color: 'text-yellow-500'  // Yellow for medium risk
    },
    {
      id: 'secure',
      name: 'Secure (Best Practice)',
      description: 'Strong credentials, updated firmware, minimal attack surface',
      healthScore: 95,  // High security score
      color: 'text-green-500'  // Green for low risk
    }
  ];

  // ===== VALIDATION =====
  
  /**
   * Validate form inputs before submission
   * Checks for required fields and proper IP format
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const newErrors = {};

    // Validate camera name (required, non-empty)
    if (!formData.name.trim()) {
      newErrors.name = 'Camera name is required';
    }

    // Validate IP address (required, proper format)
    if (!formData.ip.trim()) {
      newErrors.ip = 'IP address is required';
    } else {
      // Basic IPv4 format validation (e.g., 192.168.1.1)
      const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
      if (!ipPattern.test(formData.ip)) {
        newErrors.ip = 'Invalid IP address format';
      }
    }

    // Update error state and return validation result
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;  // Valid if no errors
  };

  /**
   * Utility: Get random element from array
   * Used for randomly assigning camera attributes
   * @param {Array} array - Array to pick from
   * @returns {*} Random element from array
   */
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // ===== FORM SUBMISSION =====
  
  /**
   * Handle form submission - validate and create camera with random attributes
   * User only provides name and IP, all other attributes auto-generated
   * This creates realistic demo data without complex forms
   * @param {Event} e - Form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();  // Prevent page reload
    
    // Validate user inputs first
    if (!validateForm()) {
      return;  // Stop if validation fails
    }

    // RANDOM ATTRIBUTE GENERATION
    // Select random values from pre-defined pools
    const randomProfile = getRandomElement(securityProfiles);  // Security level
    const randomModel = getRandomElement(cameraModels);  // Camera model
    const randomFirmware = getRandomElement(firmwareVersions);  // Firmware version
    const randomPort = getRandomElement(commonPorts);  // HTTP port
    const randomCredentials = getRandomElement(weakCredentials);  // Credentials
    
    // Extract manufacturer name from model string
    const manufacturer = randomModel.split(' ')[0];  // e.g., "Hikvision" from "Hikvision DS-2CD2042WD"
    
    // Create camera object with random data
    const newCamera = {
      name: `${formData.name} - ${formData.ip}`,
      device_name: formData.name,
      ip: formData.ip,
      ip_address: formData.ip,
      port: randomPort,
      model: randomModel,
      firmware_version: randomFirmware,
      health_score: randomProfile.healthScore,
      risk_level: randomProfile.healthScore < 40 ? 'CRITICAL' : 
                  randomProfile.healthScore < 60 ? 'HIGH' :
                  randomProfile.healthScore < 80 ? 'MEDIUM' : 'LOW',
      status: 'online',
      detected_username: randomCredentials.username,
      detected_password: randomCredentials.password,
      scan_time: new Date().toISOString(),
      manual: true, // Flag to identify manually added cameras
      securityProfile: randomProfile.id,
      // Add nested objects for DeviceModal compatibility
      device_info: {
        model: randomModel,
        manufacturer: manufacturer,
        serial: `SN${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      },
      firmware_info: {
        version: randomFirmware,
        status: randomProfile.healthScore >= 80 ? 'Up to date' : 
                randomProfile.healthScore >= 60 ? 'Update available' : 
                'Outdated - Security risk',
        release_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      container_name: formData.name.toLowerCase().replace(/\s+/g, '-')
    };

    // Generate vulnerabilities based on random profile
    newCamera.vulnerabilities = generateVulnerabilities(randomProfile.id, newCamera);
    
    // Generate open ports based on random profile
    newCamera.open_ports = generateOpenPorts(randomProfile.id, randomPort);

    onAddCamera(newCamera);
    handleClose();
  };

  const generateVulnerabilities = (profile, camera) => {
    const vulnerabilities = [];

    if (profile === 'vulnerable') {
      vulnerabilities.push(
        {
          name: 'Weak Default Credentials',
          severity: 'CRITICAL',
          description: `Camera uses weak credentials: ${camera.detected_username}/${camera.detected_password}`,
          recommendation: 'Change to strong password immediately'
        },
        {
          name: 'Outdated Firmware',
          severity: 'HIGH',
          description: `Firmware ${camera.firmware_version} has known vulnerabilities`,
          recommendation: 'Update to latest firmware version'
        },
        {
          name: 'Insecure Telnet Service',
          severity: 'HIGH',
          description: 'Telnet service (port 23) is exposed and unencrypted',
          recommendation: 'Disable Telnet, use SSH instead'
        },
        {
          name: 'Open FTP Service',
          severity: 'MEDIUM',
          description: 'FTP service exposed without encryption',
          recommendation: 'Use SFTP or disable FTP'
        }
      );
    } else if (profile === 'moderate') {
      vulnerabilities.push(
        {
          name: 'Default Credentials',
          severity: 'HIGH',
          description: 'Camera using default factory credentials',
          recommendation: 'Change default password'
        },
        {
          name: 'Unencrypted HTTP',
          severity: 'MEDIUM',
          description: 'Web interface uses HTTP instead of HTTPS',
          recommendation: 'Enable HTTPS encryption'
        }
      );
    } else if (profile === 'good') {
      vulnerabilities.push(
        {
          name: 'Minor Configuration Issue',
          severity: 'LOW',
          description: 'Some non-critical settings could be improved',
          recommendation: 'Review security settings'
        }
      );
    }

    return vulnerabilities;
  };

  const generateOpenPorts = (profile, mainPort) => {
    const ports = [{ port: mainPort, service: 'http', protocol: 'tcp' }];

    if (profile === 'vulnerable') {
      ports.push(
        { port: 23, service: 'telnet', protocol: 'tcp' },
        { port: 21, service: 'ftp', protocol: 'tcp' },
        { port: 554, service: 'rtsp', protocol: 'tcp' },
        { port: 8000, service: 'http-alt', protocol: 'tcp' }
      );
    } else if (profile === 'moderate') {
      ports.push(
        { port: 554, service: 'rtsp', protocol: 'tcp' },
        { port: 8000, service: 'http-alt', protocol: 'tcp' }
      );
    } else if (profile === 'good') {
      ports.push(
        { port: 554, service: 'rtsp', protocol: 'tcp' }
      );
    }

    return ports;
  };

  const handleClose = () => {
    setFormData({
      name: '',
      ip: ''
    });
    setErrors({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="bg-[#0F1629]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-cyan-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Camera className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Add Camera Manually</h2>
                  <p className="text-sm text-gray-400">Configure a custom camera for simulation</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Camera Information</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Enter camera name and IP address. All other attributes (model, firmware, credentials, security profile) will be randomly assigned.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Camera Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g., Front Door Camera"
                      className={`w-full px-4 py-2 bg-[#1a1a2e] border ${
                        errors.name ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      IP Address *
                    </label>
                    <input
                      type="text"
                      name="ip"
                      value={formData.ip}
                      onChange={handleChange}
                      placeholder="e.g., 192.168.1.50"
                      className={`w-full px-4 py-2 bg-[#1a1a2e] border ${
                        errors.ip ? 'border-red-500' : 'border-gray-600'
                      } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500`}
                    />
                    {errors.ip && (
                      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.ip}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Random Assignment Info */}
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-cyan-400 mb-2">Auto-Generated Attributes:</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• <span className="text-gray-400">Model:</span> Random from 10 camera models</li>
                  <li>• <span className="text-gray-400">Firmware:</span> Random version (1.0.0 - 5.2.1)</li>
                  <li>• <span className="text-gray-400">Port:</span> Random common port (80, 8080, 554, etc.)</li>
                  <li>• <span className="text-gray-400">Credentials:</span> Random weak credentials</li>
                  <li>• <span className="text-gray-400">Security Profile:</span> Random (Vulnerable/Moderate/Good/Secure)</li>
                  <li>• <span className="text-gray-400">Vulnerabilities:</span> Based on security profile</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-cyan-500/20">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  icon={Plus}
                  className="flex-1"
                >
                  Add Camera
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddCameraModal;
