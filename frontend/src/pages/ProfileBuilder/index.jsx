import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaDownload, FaEye, FaFileImport, FaRedo, FaSave, FaSearch, FaSyncAlt, FaTrash, FaUpload } from 'react-icons/fa'
import ChipInput from '../../components/ChipInput'
import ProfilePreview from '../../components/ProfilePreview'
import { profileService } from '../../services/profileService'
import { resumeParserService } from '../../services/resumeParserService'

const defaultProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  education: [],
  projects: [],
  experience: [],
  skills: [],
  hackathons: [],
  internships: [],
  achievements: [],
  certifications: [],
  languages: [],
  preferredRoles: [],
  github: '',
  linkedin: '',
  portfolio: '',
  profilePhotoName: '',
  profilePhotoPath: '',
  resumeFileName: '',
  resumeFilePath: ''
}

const localDraftKey = 'radix-profile-builder-draft-v2'

function mergeAutofill(current, incoming) {
  const merged = { ...current }
  Object.entries(incoming).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (!Array.isArray(merged[key]) || merged[key].length === 0) merged[key] = value
      return
    }
    if (!merged[key]) merged[key] = value
  })
  return merged
}

export default function ProfileBuilderPage({ pushToast }) {
  const [loading, setLoading] = useState(false)
  const [skillQuery, setSkillQuery] = useState('')
  const [previewData, setPreviewData] = useState(null)
  const importingRef = useRef(null)

  const {
    register,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors }
  } = useForm({
    defaultValues: (() => {
      const draft = localStorage.getItem(localDraftKey)
      return draft ? JSON.parse(draft) : defaultProfile
    })()
  })

  const profile = watch()

  useEffect(() => {
    localStorage.setItem(localDraftKey, JSON.stringify(profile))
    const timer = setTimeout(async () => {
      try {
        await profileService.autosaveProfile(profile)
      } catch {
        // silent autosave failure
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [profile])

  const updateField = (field, value) => setValue(field, value, { shouldDirty: true })

  const addListItem = (field) => updateField(field, [...(profile[field] || []), ''])
  const updateListItem = (field, index, value) => {
    const next = [...(profile[field] || [])]
    next[index] = value
    updateField(field, next)
  }
  const removeListItem = (field, index) => updateField(field, (profile[field] || []).filter((_, i) => i !== index))

  const onSave = async () => {
    if (!profile.name?.trim()) {
      pushToast('Name is required.', 'error')
      return
    }
    if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) {
      pushToast('Please enter a valid email.', 'error')
      return
    }

    setLoading(true)
    try {
      const { data } = await profileService.createProfile(profile)
      reset(data.data || profile)
      pushToast('Profile saved successfully.')
    } catch {
      pushToast('Profile save failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onUpdate = async () => {
    setLoading(true)
    try {
      const { data } = await profileService.updateProfile(profile)
      reset(data.data || profile)
      pushToast('Profile updated successfully.')
    } catch {
      pushToast('Profile update failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onLoad = async () => {
    setLoading(true)
    try {
      const { data } = await profileService.getProfile()
      reset({ ...defaultProfile, ...(data.data || {}) })
      pushToast('Profile loaded successfully.')
    } catch {
      pushToast('No profile found to load.', 'info')
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    setLoading(true)
    try {
      await profileService.deleteProfile()
      reset(defaultProfile)
      pushToast('Profile deleted.')
    } catch {
      pushToast('Delete failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const onReset = async () => {
    setLoading(true)
    try {
      await profileService.resetProfile()
      reset(defaultProfile)
      localStorage.removeItem(localDraftKey)
      pushToast('Profile reset completed.')
    } catch {
      pushToast('Reset failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleImportClick = () => importingRef.current?.click()

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const json = JSON.parse(await file.text())
      const payload = { ...defaultProfile, ...json }
      const { data } = await profileService.importProfile(payload)
      reset({ ...defaultProfile, ...(data.data || payload) })
      pushToast('Profile imported.')
    } catch {
      pushToast('Invalid profile JSON.', 'error')
    }
  }

  const handleExport = async () => {
    try {
      const response = await profileService.exportProfile()
      const url = window.URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'profile.json'
      a.click()
      window.URL.revokeObjectURL(url)
      pushToast('Profile exported.')
    } catch {
      pushToast('Export failed.', 'error')
    }
  }

  const handlePreview = async () => {
    try {
      await profileService.updateProfile(profile)
      const { data } = await profileService.previewProfile()
      setPreviewData(data.data)
      pushToast('Preview refreshed.')
    } catch {
      pushToast('Preview failed.', 'error')
    }
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setLoading(true)
    try {
      await profileService.uploadResume(file)
      const { data } = await resumeParserService.parse({ resumeFile: file })
      const candidate = data.data?.candidate || {}
      const merged = mergeAutofill(getValues(), candidate)
      merged.resumeFileName = file.name
      reset(merged)
      pushToast('Resume parsed and profile auto-filled.')
    } catch {
      pushToast('Resume upload/parsing failed.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const { data } = await profileService.uploadPhoto(file)
      updateField('profilePhotoName', data.data.profilePhotoName)
      updateField('profilePhotoPath', data.data.profilePhotoPath)
      pushToast('Profile photo uploaded.')
    } catch {
      pushToast('Profile photo upload failed.', 'error')
    }
  }

  const filteredSkills = useMemo(() => {
    if (!skillQuery.trim()) return profile.skills || []
    return (profile.skills || []).filter((skill) => skill.toLowerCase().includes(skillQuery.toLowerCase()))
  }, [profile.skills, skillQuery])

  const dynamicFields = ['education', 'projects', 'experience', 'hackathons', 'internships', 'achievements', 'certifications', 'preferredRoles']

  return (
    <section className="grid xl:grid-cols-3 gap-4">
      <div className="xl:col-span-2 glass rounded-2xl p-5 shadow-premium space-y-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSave} disabled={loading} className="px-3 py-2 rounded-lg bg-indigo-600 text-white inline-flex items-center gap-2"><FaSave /> Save</button>
          <button type="button" onClick={onLoad} disabled={loading} className="px-3 py-2 rounded-lg bg-slate-700 text-white inline-flex items-center gap-2"><FaDownload /> Load</button>
          <button type="button" onClick={onUpdate} disabled={loading} className="px-3 py-2 rounded-lg bg-emerald-600 text-white inline-flex items-center gap-2"><FaSyncAlt /> Update</button>
          <button type="button" onClick={onDelete} disabled={loading} className="px-3 py-2 rounded-lg bg-rose-600 text-white inline-flex items-center gap-2"><FaTrash /> Delete</button>
          <button type="button" onClick={onReset} disabled={loading} className="px-3 py-2 rounded-lg bg-orange-600 text-white inline-flex items-center gap-2"><FaRedo /> Reset</button>
          <button type="button" onClick={handleImportClick} disabled={loading} className="px-3 py-2 rounded-lg bg-purple-600 text-white inline-flex items-center gap-2"><FaFileImport /> Import JSON</button>
          <button type="button" onClick={handleExport} disabled={loading} className="px-3 py-2 rounded-lg bg-cyan-700 text-white inline-flex items-center gap-2"><FaDownload /> Export JSON</button>
          <button type="button" onClick={handlePreview} disabled={loading} className="px-3 py-2 rounded-lg bg-sky-600 text-white inline-flex items-center gap-2"><FaEye /> Preview</button>
        </div>

        <input ref={importingRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input {...register('name', { required: true })} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
            {errors.name && <p className="text-xs text-rose-500 mt-1">Name is required</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input {...register('email')} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
          </div>
          {['phone', 'location', 'github', 'linkedin', 'portfolio'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1 capitalize">{field}</label>
              <input {...register(field)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <label className="rounded-xl border border-dashed border-slate-400/40 p-4 cursor-pointer">
            <p className="font-medium inline-flex items-center gap-2"><FaUpload /> Resume Upload</p>
            <p className="text-sm opacity-70">{profile.resumeFileName || 'Upload PDF/DOCX resume'}</p>
            <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleResumeUpload} />
          </label>
          <label className="rounded-xl border border-dashed border-slate-400/40 p-4 cursor-pointer">
            <p className="font-medium inline-flex items-center gap-2"><FaUpload /> Profile Picture Upload</p>
            <p className="text-sm opacity-70">{profile.profilePhotoName || 'Upload profile image'}</p>
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <ChipInput label="Skills" values={profile.skills || []} onChange={(value) => updateField('skills', value)} placeholder="Add skill" />
          <ChipInput label="Languages" values={profile.languages || []} onChange={(value) => updateField('languages', value)} placeholder="Add language" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Search Skills</label>
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 opacity-70" />
            <input value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} className="w-full pl-10 rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" placeholder="Search skill chips" />
          </div>
          <div className="flex flex-wrap gap-2">
            {filteredSkills.length === 0 ? <p className="text-sm opacity-70">No skills match this search.</p> : filteredSkills.map((skill) => <span key={skill} className="text-xs rounded-full bg-indigo-500/15 px-3 py-1">{skill}</span>)}
          </div>
        </div>

        {dynamicFields.map((field) => (
          <div key={field} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium capitalize">{field}</label>
              <button type="button" onClick={() => addListItem(field)} className="text-xs px-2 py-1 rounded bg-indigo-600 text-white">Add</button>
            </div>
            {(profile[field] || []).map((value, idx) => (
              <div key={`${field}-${idx}`} className="flex gap-2">
                <input value={value} onChange={(e) => updateListItem(field, idx, e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2" />
                <button type="button" onClick={() => removeListItem(field, idx)} className="px-3 py-2 rounded-lg bg-rose-600 text-white">Remove</button>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <ProfilePreview profile={profile} />
        {previewData && (
          <article className="glass rounded-2xl p-5 shadow-premium text-sm space-y-2">
            <h4 className="font-semibold">Backend Preview Snapshot</h4>
            <p><strong>Headline:</strong> {previewData.headline || '-'}</p>
            <p><strong>Top Skills:</strong> {(previewData.skills || []).join(', ') || '-'}</p>
            <p><strong>Projects:</strong> {(previewData.projects || []).join(', ') || '-'}</p>
          </article>
        )}
      </div>
    </section>
  )
}
