import { Metadata } from "next"
import ScreeningDataClient from "./screening-data-client"

export const metadata: Metadata = {
    title: "Screening Data",
}

export default function ScreeningDataPage() {
    return <ScreeningDataClient />
}
