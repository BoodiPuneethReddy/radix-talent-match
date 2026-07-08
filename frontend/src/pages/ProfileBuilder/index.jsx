import { useCallback, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FaTrash, FaSave, FaSyncAlt, FaDownload } from 'react-icons/fa'
import ChipInput from '../../components/ChipInput'
import FileDropzone from '../../components/FileDropzone'
import ProfilePreview from '../../components/ProfilePreview'
import { profileService } from '../../services/profileService'
import { useAutosave } from '../../hooks/useAutosave'

const defaultProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  education: '',
  skills: [],
  projects: [],
  experience: [],
  hackathons: [],
  internships: [],
  certifications: [],
  achievements: [],
  preferredRoles: [],
  languages: [],
  github: '',
  linkedin: '',
  portfolio: '',
  profilePhotoName: '',
  resumeFileName: ''
}

const localKey = 'radix-profile-builder-draft'

export default function ProfileBuilderPage({ pushToast }) {
  const [profile, setProfile] = useState(() => {
    const draft = localStorage.getItem(localKey)
    return draft ? JSON.parse(draft) : defaultProfile
  })
  const [touched, setTouched] = useState({})
  const [loading, setLoading] = useState(false)

  const setField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const validate = useMemo(() => {
    const errors = {}
    if (!profile.name.trim()) errors.name = 'Name is required'
    if (!profile.email.match(/^\S+@\S+\.\S+$/)) errors.email = 'Valid email is required'
    if (profile.phone && !profile.phone.match(/^[\d+\-()\s]{7,20}$/)) errors.phone = 'Invalid phone format'
    return errors
  }, [profile])

  const saveDraft = useCallback((draft) => {
    localStorage.setItem(localKey, JSON.stringify(draft))
  }, [])

  useAutosave(profile, saveDraft)

  const handleApi = async (apiCall, successMessage) => {
    if (Object.keys(validate).length) {
      pushToast('Fix validation errors before saving.', 'error')
      return
    }
    setLoading(true)
    try {
      const { data } = await apiCall(profile)
      setProfile(data.data)
      saveDraft(data.data)
      pushToast(successMessage)
    } catch {
      pushToast('Request failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = async () => {
    setLoading(true)
    try {
      const { data } = await profileService.getProfile()
      setProfile(data.data || defaultProfile)
      saveDraft(data.data || defaultProfile)
      pushToast('Profile loaded successfully.')
    } catch {
      pushToast('No saved profile found yet.', 'info')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    try {
      await profileService.deleteProfile()
      setProfile(defaultProfile)
      setTouched({})
      localStorage.removeItem(localKey)
      pushToast('Profile deleted.')
    } catch {
      pushToast('Delete failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleResumeUpload = async (file) => {
    setField('resumeFileName', file.name)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const { data } = await profileService.analyzeResume(formData)
      const parsed = data?.data || {}
      setProfile((prev) => {
        const next = { ...prev }
        ;['name', 'email', 'education', 'github', 'linkedin', 'portfolio'].forEach((field) => {
          if (!touched[field] && (!prev[field] || prev[field].trim() === '')) next[field] = parsed[field] || prev[field]
        })
        ;['projects', 'experience', 'skills', 'certifications'].forEach((field) => {
          if (!touched[field] && (!prev[field] || prev[field].length === 0)) next[field] = parsed[field] || prev[field]
        })
        return next
      })
      pushToast('Resume parsed and draft fields autofilled.')
    } catch {
      pushToast('Resume Parser module is not available yet.', 'info')
    }
  }

  const addRemoveListItem = (field, idx, value) => {
    const list = [...profile[field]]
    list[idx] = value
    setField(field, list)
  }

  const removeListItem = (field, idx) => setField(field, profile[field].filter((_, i) => i !== idx))
  const addListItem = (field) => setField(field, [...profile[field], ''])

  const listFields = ['projects', 'experience', 'hackathons', 'internships', 'certifications', 'achievements', 'preferredRoles']

  return (
    <section className="grid xl:grid-cols-3 gap-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="xl:col-span-2 glass rounded-2xl p-5 shadow-premium space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={loading} onClick={() => handleApi(profileService.createProfile, 'Profile saved successfully.')} className="px-3 py-2 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-2"><FaSave /> Save Profile</button>
          <button type="button" disabled={loading} onClick={() => handleApi(profileService.updateProfile, 'Profile updated successfully.')} className="px-3 py-2 rounded-lg bg-emerald-600 text-white inline-flex items-center gap-2"><FaSyncAlt /> Update Profile</button>
          <button type="button" disabled={loading} onClick={handleLoad} className="px-3 py-2 rounded-lg bg-slate-700 text-white inline-flex items-center gap-2"><FaDownload /> Load Profile</button>
          <button type="button" disabled={loading} onClick={handleDelete} className="px-3 py-2 rounded-lg bg-rose-600 text-white inline-flex items-center gap-2"><FaTrash /> Delete Profile</button>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          {['name', 'email', 'phone', 'location', 'education', 'github', 'linkedin', 'portfolio'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
              <input
                value={profile[field]}
                onChange={(e) => setField(field, e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
              />
              {validate[field] && <p className="text-xs text-rose-500 mt-1">{validate[field]}</p>}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <FileDropzone label={`Resume Upload ${profile.resumeFileName ? `(${profile.resumeFileName})` : ''}`} accept=".pdf,.doc,.docx" onFileSelect={handleResumeUpload} />
          <FileDropzone label={`Profile Photo Upload ${profile.profilePhotoName ? `(${profile.profilePhotoName})` : ''}`} accept="image/*" onFileSelect={(file) => setField('profilePhotoName', file.name)} />
        </div>

        <ChipInput label="Skills" values={profile.skills} onChange={(v) => setField('skills', v)} placeholder="Add skill" />
        <ChipInput label="Languages" values={profile.languages} onChange={(v) => setField('languages', v)} placeholder="Add language" />

        {listFields.map((field) => (
          <div key={field} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium capitalize">{field}</label>
              <button type="button" onClick={() => addListItem(field)} className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Add</button>
            </div>
            {(profile[field] || []).map((value, idx) => (
              <div key={`${field}-${idx}`} className="flex gap-2">
                <input
                  value={value}
                  onChange={(e) => addRemoveListItem(field, idx, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2"
                />
                <button type="button" onClick={() => removeListItem(field, idx)} className="px-3 py-2 rounded-lg bg-rose-600 text-white">Remove</button>
              </div>
            ))}
          </div>
        ))}
      </motion.div>

      <ProfilePreview profile={profile} />
    </section>
  )
}
