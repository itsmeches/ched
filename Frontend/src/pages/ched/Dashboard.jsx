import { useAuth } from '../../context/AuthContext'

export default function CHEDDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Pending Proposals', value: '45', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-yellow-500' },
    { label: 'Approved', value: '32', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-green-500' },
    { label: 'Rejected', value: '12', icon: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-red-500' },
    { label: 'Active HEIs', value: '42', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', color: 'bg-blue-500' },
  ]

  const pendingProposals = [
    { title: 'Impact of K-12 Implementation', institution: 'University of Lipa', date: 'Apr 18, 2026', status: 'pending' },
    { title: 'STEM Education in Region IV-A', institution: 'Batangas State University', date: 'Apr 17, 2026', status: 'pending' },
  ]

  const getStatusBadge = (status) => {
    const styles = { pending: 'bg-yellow-100 text-yellow-800', approved: 'bg-green-100 text-green-800', rejected: 'bg-red-100 text-red-800' }
    const labels = { pending: 'Pending Review', approved: 'Approved', rejected: 'Rejected' }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1a365d]">CHED Regional Office IV-A</h2>
        <p className="text-gray-500 mt-1">Welcome, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`${stat.color} p-3 rounded-xl text-white`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pending Approvals</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Research Title</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Institution</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Submitted</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingProposals.map((proposal, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800">{proposal.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{proposal.institution}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{proposal.date}</td>
                  <td className="py-3 px-4">{getStatusBadge(proposal.status)}</td>
                  <td className="py-3 px-4">
                    <button className="px-3 py-1.5 bg-[#2c5282] text-white rounded-md text-sm hover:bg-[#1a365d] transition-colors">Review</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">View All Proposals</button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Generate Report</button>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">Export Data</button>
        </div>
      </div>
    </div>
  )
}