import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Button, ScrollView, Text, View } from "react-native";
import { z } from "zod";
import { writeNdef } from "../util/nfc-io";


export const ticketSchema = z.object({
    id: z.string(),
    eventId: z.string(),
})

export default function Writer() {

    const url = "https://nfc-ticket-one.vercel.app/api/ticketProduced"

    const [tickets, setTickets] = useState<z.infer<typeof ticketSchema>[]>()
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState("")
    const [currentTicket, setCurrentTicket] = useState<z.infer<typeof ticketSchema>>()

    useEffect(() => {
        async function getUnproducedTickets() {
            try {
                setLoading(true)
                const res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ API_KEY: "421c76d77563afa1914846b010bd164f395bd34c2102e5e99e0cb9cf173c1d87" }),
                    method: 'POST'
                })


                const data = await res.json()

                if (validateTickets(data)) {
                    setTickets(data)
                    console.log("Found tickets", data.length)
                } else {
                    Alert.alert("Error", "Invalid response from server")
                }
                setLoading(false)
            } catch (error) {
                console.error(error)
            }
        }

        getUnproducedTickets()

    }, [])


    if (loading) return <ActivityIndicator />

    if (!tickets || !tickets.length) return <Text>No Tickets to be generated</Text>

    async function handleWrite({ id, eventId }: z.infer<typeof ticketSchema>) {

        setCurrentTicket({ id, eventId })

        const success = await writeNFC({ id, eventId })
        if (success) {
            setMessage("Ticket written")
            updateTicketProduced({ id, eventId })
            setTickets(tickets!.filter((ticket) => ticket.id !== id))
        } else {
            setMessage("Failed to write ticket")
        }
        setCurrentTicket(undefined)

    }

    return (
        <View>
            <Text>Total Tickets to generate: {tickets.length}</Text>
            <Text>{message}</Text>
            <ScrollView>

                {
                    tickets.slice(0, 5).map((ticket) => {

                        return <View key={ticket.id} style={{ marginBottom: 5 }} >
                            {ticket.id === currentTicket?.id ?
                                <Button disabled={true} title={"Writing " + ticket.id.slice(0, 5) + "..."} /> :
                                <Button onPress={() => handleWrite({ ...ticket })} title={ticket.id.slice(0, 5) + "..."} />
                            }
                        </View>
                    })
                }
            </ScrollView>
        </View>
    )
}


function validateTickets(tickets: any): tickets is z.infer<typeof ticketSchema>[] {
    const responseSchema = z.array(ticketSchema)
    return responseSchema.safeParse(tickets).success
}


async function writeNFC({ id, eventId }: z.infer<typeof ticketSchema>) {
    return await writeNdef({ type: "TEXT", value: JSON.stringify({ id, eventId }) })
}

async function updateTicketProduced({ id, eventId }: z.infer<typeof ticketSchema>) {
    const url = "https://nfc-ticket-one.vercel.app/api/ticketProduced/produced"

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ API_KEY: "421c76d77563afa1914846b010bd164f395bd34c2102e5e99e0cb9cf173c1d87", id, eventId }),
        method: 'POST'
    })

    return await res.json()
}