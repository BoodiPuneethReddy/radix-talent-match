import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import ChipInput from '../../components/ChipInput'
import DynamicObjectList from '../../components/DynamicObjectList'
import DynamicTextList from '../../components/DynamicTextList'
import FileDropzone from '../../components/FileDropzone'
import { useToast } from '../../components/ToastProvider'
import { useAutosave } from '../../hooks/useAutosave'
import { profileService, resumeService } from '../../services/moduleService'

const initialProfile = {
  name: '',
  email: '',
  phone: '',
  location: '',
  education: [],
  skills: [],
  projects: [],
  experience: [],
  hackathons: [],
  internships: [],
  certifications: [],
  achievements: [],
  preferred_roles: [],
  languages: [],
  github: '',
  linkedin: '',
  portfolio: '',
  resume_file: '',
  profile_photo: '',
}

function ProfileBuilderPage() {
  const [profile, setProfile] = useState(initialProfile)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [touchedFields, setTouchedFields] = useState(new Set())
  const { showToast } = useToast()

  const markTouched = (field) => setTouchedFields((prev) => new Set([...prev, field]))

  const updateField = (field, value) => {
    markTouched(field)
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true)
      const data = await profileService.load()
      setProfile({ ...initialProfile, ...data.profile, email: data.profile?.email || '' })
    } catch {
      showToast('Failed to load profile.', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const validate = useCallback(() => {
    if (!profile.name.trim()) return 'Name is required.'
    if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) return 'Email format is invalid.'
    return null
  }, [profile])

  const autosave = useCallback(
    async (value) => {
      if (loading) return
      try {
        await profileService.autosave(value)
      } catch {
        showToast('Autosave failed.', 'error')
      }
    },
    [loading, showToast],
  )

  useAutosave(profile, autosave, 1800)

  const handleSave = async () => {
    const error = validate()
    if (error) return showToast(error, 'error')
    try {
      setSaving(true)
      await profileService.save(profile)
      showToast('Profile saved.', 'success')
    } catch {
      showToast('Save failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdate = async () => {
    const error = validate()
    if (error) return showToast(error, 'error')
    try {
      setSaving(true)
      await profileService.update(profile)
      showToast('Profile updated.', 'success')
    } catch {
      showToast('Update failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setSaving(true)
      await profileService.delete()
      setProfile(initialProfile)
      setTouchedFields(new Set())
      showToast('Profile deleted.', 'success')
    } catch {
      showToast('Delete failed.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (file) => {
    try {
      await profileService.uploadResume(file)
      updateField('resume_file', file.name)
      showToast('Resume uploaded.', 'success')
    } catch {
      showToast('Resume upload failed.', 'error')
    }

    try {
      const parsed = await resumeService.analyze(file)
      const parsedProfile = parsed?.profile || parsed || {}
      setProfile((prev) => {
        const next = { ...prev }
        const fields = [
          'name',
          'email',
          'education',
          'projects',
          'experience',
          'skills',
          'certifications',
          'github',
          'linkedin',
          'portfolio',
        ]
        fields.forEach((field) => {
          if (touchedFields.has(field)) return
          const incoming = parsedProfile[field]
          if (incoming === undefined || incoming === null) return
          if (Array.isArray(incoming) && incoming.length === 0) return
          if (typeof incoming === 'string' && !incoming.trim()) return
          next[field] = incoming
        })
        return next
      })
      showToast('Resume parsed and applied.', 'success')
    } catch (error) {
      if (error?.response?.status === 501 || error?.response?.status === 404) {
        showToast('Resume Parser module is not available yet.', 'info')
      } else {
        showToast('Resume parsing failed; you can continue manually.', 'error')
      }
    }
  }

  const handlePhotoUpload = async (file) => {
    try {
      await profileService.uploadPhoto(file)
      updateField('profile_photo', file.name)
      showToast('Profile photo uploaded.', 'success')
    } catch {
      showToast('Photo upload failed.', 'error')
    }
  }

  const progress = useMemo(() => {
    const keys = Object.keys(profile)
    const done = keys.filter((key) => {
      const value = profile[key]
      if (Array.isArray(value)) return value.length > 0
      return Boolean(value)
    }).length
    return Math.round((done / keys.length) * 100)
  }, [profile])

  if (loading) {
    return <div className="animate-pulse text-sm text-slate-500">Loading profile...</div>
  }

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 xl:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Profile Builder</h3>
          <div className="text-sm text-slate-500">Completion {progress}%</div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {[
            ['name', 'Name'],
            ['email', 'Email'],
            ['phone', 'Phone'],
            ['location', 'Location'],
            ['github', 'GitHub'],
            ['linkedin', 'LinkedIn'],
            ['portfolio', 'Portfolio'],
          ].map(([field, label]) => (
            <label key={field} className="space-y-1 text-sm">
              <span className="font-medium">{label}</span>
              <input
                type={field === 'email' ? 'email' : 'text'}
                value={profile[field]}
                onChange={(event) => updateField(field, event.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              />
            </label>
          ))}
        </div>

        <ChipInput
          label="Skills"
          values={profile.skills}
          onAdd={(value) => updateField('skills', [...profile.skills, value])}
          onRemove={(index) => updateField('skills', profile.skills.filter((_, i) => i !== index))}
        />

        <DynamicObjectList
          title="Education"
          fields={[
            { key: 'degree', label: 'Degree' },
            { key: 'institution', label: 'Institution' },
            { key: 'year', label: 'Year' },
          ]}
          values={profile.education}
          onChange={(value) => updateField('education', value)}
        />

        <DynamicObjectList
          title="Projects"
          fields={[
            { key: 'name', label: 'Project Name' },
            { key: 'description', label: 'Description' },
            { key: 'link', label: 'Link' },
          ]}
          values={profile.projects}
          onChange={(value) => updateField('projects', value)}
        />

        <DynamicObjectList
          title="Experience"
          fields={[
            { key: 'title', label: 'Role' },
            { key: 'company', label: 'Company' },
            { key: 'duration', label: 'Duration' },
            { key: 'description', label: 'Description' },
          ]}
          values={profile.experience}
          onChange={(value) => updateField('experience', value)}
        />

        <div className="grid gap-3 md:grid-cols-2">
          <DynamicTextList
            title="Hackathons"
            values={profile.hackathons}
            onChange={(value) => updateField('hackathons', value)}
            placeholder="Hackathon"
          />
          <DynamicTextList
            title="Internships"
            values={profile.internships}
            onChange={(value) => updateField('internships', value)}
            placeholder="Internship"
          />
          <DynamicTextList
            title="Certifications"
            values={profile.certifications}
            onChange={(value) => updateField('certifications', value)}
            placeholder="Certification"
          />
          <DynamicTextList
            title="Achievements"
            values={profile.achievements}
            onChange={(value) => updateField('achievements', value)}
            placeholder="Achievement"
          />
          <DynamicTextList
            title="Preferred Roles"
            values={profile.preferred_roles}
            onChange={(value) => updateField('preferred_roles', value)}
            placeholder="Preferred role"
          />
          <DynamicTextList
            title="Languages"
            values={profile.languages}
            onChange={(value) => updateField('languages', value)}
            placeholder="Language"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <FileDropzone
            label="Resume Upload"
            fileName={profile.resume_file}
            accept=".pdf,.doc,.docx"
            onFileSelect={handleResumeUpload}
          />
          <FileDropzone
            label="Profile Photo Upload"
            fileName={profile.profile_photo}
            accept="image/*"
            onFileSelect={handlePhotoUpload}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-brand-500 px-4 py-2 text-white disabled:opacity-60"
          >
            Save Profile
          </button>
          <button
            type="button"
            onClick={handleUpdate}
            disabled={saving}
            className="rounded-xl border border-brand-500 px-4 py-2 text-brand-500 disabled:opacity-60"
          >
            Update Profile
          </button>
          <button
            type="button"
            onClick={loadProfile}
            disabled={saving}
            className="rounded-xl border border-slate-300 px-4 py-2 disabled:opacity-60 dark:border-slate-700"
          >
            Load Profile
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="rounded-xl bg-rose-500 px-4 py-2 text-white disabled:opacity-60"
          >
            Delete Profile
          </button>
        </div>
      </motion.section>

      <motion.aside initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
        <h4 className="text-lg font-semibold">Profile Preview</h4>
        <div className="space-y-2 text-sm">
          <p><span className="font-medium">Name:</span> {profile.name || '-'}</p>
          <p><span className="font-medium">Email:</span> {profile.email || '-'}</p>
          <p><span className="font-medium">Phone:</span> {profile.phone || '-'}</p>
          <p><span className="font-medium">Location:</span> {profile.location || '-'}</p>
          <p><span className="font-medium">Skills:</span> {profile.skills.join(', ') || '-'}</p>
          <p><span className="font-medium">Roles:</span> {profile.preferred_roles.join(', ') || '-'}</p>
          <p><span className="font-medium">Resume:</span> {profile.resume_file || '-'}</p>
          <p><span className="font-medium">Photo:</span> {profile.profile_photo || '-'}</p>
        </div>
      </motion.aside>
    </div>
  )
}

export default ProfileBuilderPage
