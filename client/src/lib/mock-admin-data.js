export const mockUsers = [
    {
        id: "usr_1",
        name: "Aditya Sharma",
        email: "aditya@example.com",
        phone: "+91 98765 43210",
        kyc_status: "verified",
        created_at: "2024-01-10T08:30:00Z",
    },
    {
        id: "usr_2",
        name: "Priya Patel",
        email: "priya@example.com",
        phone: "+91 87654 32109",
        kyc_status: "pending",
        created_at: "2024-02-15T11:20:00Z",
    },
    {
        id: "usr_3",
        name: "Rahul Verma",
        email: "rahul@example.com",
        phone: "+91 76543 21098",
        kyc_status: "rejected",
        created_at: "2024-03-05T14:45:00Z",
    },
    {
        id: "usr_4",
        name: "Sneha Reddy",
        email: "sneha@example.com",
        phone: "+91 65432 10987",
        kyc_status: "pending",
        created_at: "2024-04-12T09:15:00Z",
    },
    {
        id: "usr_5",
        name: "Vikram Singh",
        email: "vikram@example.com",
        phone: "+91 54321 09876",
        kyc_status: "verified",
        created_at: "2024-05-20T16:30:00Z",
    },
];

export const mockAlerts = [
    {
        id: "alt_1",
        user_id: "usr_1",
        type: "error",
        message: "Multiple failed login attempts detected from unknown IP.",
        created_at: "2024-05-21T10:00:00Z",
        read: false,
    },
    {
        id: "alt_2",
        user_id: "usr_2",
        type: "warning",
        message: "High value transaction (₹50,000) requires manual review.",
        created_at: "2024-05-21T11:30:00Z",
        read: false,
    },
    {
        id: "alt_3",
        user_id: "usr_3",
        type: "info",
        message: "KYC document re-submission received.",
        created_at: "2024-05-21T12:45:00Z",
        read: true,
    },
];
