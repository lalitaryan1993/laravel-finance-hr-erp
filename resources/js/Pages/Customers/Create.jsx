import { useEffect } from 'react'
import { router } from '@inertiajs/react'

export default function CustomerCreate() {
    useEffect(() => { router.visit('/customers') }, [])
    return null
}
