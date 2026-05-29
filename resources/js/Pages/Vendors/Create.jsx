import { useEffect } from 'react'
import { router } from '@inertiajs/react'

export default function VendorCreate() {
    useEffect(() => { router.visit('/vendors') }, [])
    return null
}
