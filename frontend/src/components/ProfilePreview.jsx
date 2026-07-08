export default function ProfilePreview({ profile }) {
  const listFields = ['skills', 'projects', 'experience', 'hackathons', 'internships', 'certifications', 'achievements', 'preferredRoles', 'languages']

  return (
    <section className="glass rounded-2xl p-5 shadow-premium h-full">
      <h3 className="text-lg font-semibold mb-3">Profile Preview</h3>
      <div className="space-y-3 text-sm">
        <p><strong>Name:</strong> {profile.name || '-'}</p>
        <p><strong>Email:</strong> {profile.email || '-'}</p>
        <p><strong>Phone:</strong> {profile.phone || '-'}</p>
        <p><strong>Location:</strong> {profile.location || '-'}</p>
        <p><strong>Education:</strong> {profile.education || '-'}</p>
        <p><strong>GitHub:</strong> {profile.github || '-'}</p>
        <p><strong>LinkedIn:</strong> {profile.linkedin || '-'}</p>
        <p><strong>Portfolio:</strong> {profile.portfolio || '-'}</p>
        {listFields.map((field) => (
          <div key={field}>
            <p className="font-semibold capitalize">{field}</p>
            <p className="opacity-80">{profile[field]?.length ? profile[field].join(', ') : '-'}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
