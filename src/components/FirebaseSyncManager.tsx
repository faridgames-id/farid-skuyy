import { useIncomeFirestore } from '../hooks/useIncomeFirestore'
import { useGymFirestore } from '../hooks/useGymFirestore'
import { useScheduleFirestore } from '../hooks/useScheduleFirestore'
import { useSavingsFirestore } from '../hooks/useSavingsFirestore'

export default function FirebaseSyncManager() {
  useIncomeFirestore()
  useGymFirestore()
  useScheduleFirestore()
  useSavingsFirestore()

  return null
}
