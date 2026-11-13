export const getPermissionStages = (type) => [
  'Department Head',
  type === 'Cultural' ? 'Cultural Coordinator' : 'Technical Coordinator',
  'DSW',
  'Registrar',
  'Vice Chancellor',
]

export const createApprovalChain = (type) => getPermissionStages(type).map((stage, index) => ({
  stage,
  status: index === 0 ? 'Pending' : 'Waiting',
  decidedAt: null,
  comment: '',
}))

export const getPermissionChain = (permission) => {
  if (Array.isArray(permission.approvalChain)) return permission.approvalChain
  const chain = createApprovalChain(permission.type)
  if (permission.status === 'Approved') {
    chain.forEach((stage) => { stage.status = 'Approved' })
  } else if (permission.status === 'Rejected') {
    chain[0].status = 'Rejected'
    chain.slice(1).forEach((stage) => { stage.status = 'Waiting' })
  }
  return chain
}