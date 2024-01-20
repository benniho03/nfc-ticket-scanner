import { type TicketStatus } from "../App"
import { StyleSheet } from 'react-native';

export function getContainerStyles(ticketStatus: TicketStatus) {
    if (ticketStatus === "valid") {
        return { ...styles.success, ...styles.container }
    }
    if (ticketStatus === "already used") {
        return { ...styles.alreadyUsed, ...styles.container }
    }
    if (ticketStatus === "invalid") {
        return { ...styles.invalid, ...styles.container }
    }
    if (ticketStatus === "loading") {
        return { ...styles.loading, ...styles.container }
    }
    return styles.container
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 40,
    },
    success: {
        backgroundColor: '#22c55e',
        color: "#0ea5e9",
    },
    alreadyUsed: {
        backgroundColor: '#f59e0b',
        color: "#0ea5e9"
    },
    invalid: {
        backgroundColor: '#ef4444',
        color: "white"
    },
    loading: {
        backgroundColor: "#0ea5e9",
        color: "white"
    }
});