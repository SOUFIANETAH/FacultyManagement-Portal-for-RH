"use client";
import { useEffect, useState } from "react";
import "../../modules/admin.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    email: string;
    password: string;
    name?: string | null;
    role: string;
    status: "PENDING" | "ACTIVE" | "REJECTED";
}

interface Request {
    id: number;
    title: string;
    description: string;
    userId: number | null;
    type: "adduser" | "deleteuser" | "updateuser" | "register";
    createdAt: string;
    status: "pending" | "dean_approved" | "dean_rejected" | "admin_approved" | "admin_rejected";
    status_user: "PENDING" | "ACTIVE" | "REJECTED";
    status_doyen: "pending" | "dean_approved" | "dean_rejected";
    status_admin: "pending" | "admin_approved" | "admin_rejected";
    department?: string | null;
    userData?: any;
    user?: User | null;
}

interface Alert {
    id: number;
    title: string;
    description: string;
    userId: number | null;
    type: "error" | "warning" | "info";
    createdAt: string;
    user?: User | null;
}

export default function AdminDashboard() {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [currentRequestPage, setCurrentRequestPage] = useState(1);
    const [currentAlertPage, setCurrentAlertPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, session, router]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetch("/api/alerts")
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    const data = await res.json();
                    return Array.isArray(data) ? data.filter((alert) => alert.type === "warning" || alert.type === "info") : [];
                })
                .catch((err) => {
                    console.error("Failed to fetch alerts:", err);
                    return [];
                }),
            fetch("/api/requests")
                .then(async (res) => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    const data = await res.json();
                    return Array.isArray(data) ? data.filter((req) => req.status_admin === "pending") : [];
                })
                .catch((err) => {
                    console.error("Failed to fetch requests:", err);
                    return [];
                }),
        ])
            .then(([alertData, requestData]) => {
                setAlerts(alertData);
                setRequests(requestData);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleApprove = async (id: number, type: string, status_doyen: string) => {
        try {
            const payload = {
                id,
                approverRole: "admin",
                status: "admin_approved",
                status_admin: "admin_approved",
                status_user: "ACTIVE",
                ...(type === "adduser" && status_doyen === "dean_approved" && { action: "create_user" })
            };

            console.log("Approving request:", payload);

            const response = await fetch("/api/requests", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error approving request:", errorData);
                throw new Error(`Request failed: ${errorData.error || response.statusText}`);
            }

            const result = await response.json();

            if (result.user) {
                // If a user was created, update the request with the new user ID
                setRequests(prev => prev.map(req =>
                    req.id === id ? { ...req, userId: result.user.id } : req
                ));
            }

            // Remove the request from the list after approval
            setRequests((prev) => prev.filter((req) => req.id !== id));

        } catch (error) {
            console.error("Failed to approve request:", error);
        }
    };

    const handleReject = async (id: number) => {
        try {
            const response = await fetch("/api/requests", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    approverRole: "admin",
                    status: "admin_rejected",
                    status_admin: "admin_rejected",
                    status_user: "REJECTED"
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setRequests((prev) => prev.filter((req) => req.id !== id));
        } catch (error) {
            console.error("Failed to reject request:", error);
        }
    };

    const handleDismiss = async (id: number) => {
        try {
            const response = await fetch("/api/alerts", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            setAlerts((prev) => prev.filter((alert) => alert.id !== id));
        } catch (error) {
            console.error("Failed to dismiss alert:", error);
        }
    };

    const getDisplayStatus = (request: Request) => {
        if (request.status_admin === "admin_approved") return "approved";
        if (request.status_admin === "admin_rejected") return "rejected";
        if (request.status_doyen === "dean_approved") return "dean approved";
        if (request.status_doyen === "dean_rejected") return "dean rejected";
        return "pending";
    };

    // ... rest of the component remains the same ...
    const indexOfLastRequest = currentRequestPage * itemsPerPage;
    const currentRequests = requests.slice(indexOfLastRequest - itemsPerPage, indexOfLastRequest);
    const totalRequestPages = Math.ceil(requests.length / itemsPerPage);

    const indexOfLastAlert = currentAlertPage * itemsPerPage;
    const currentAlerts = alerts.slice(indexOfLastAlert - itemsPerPage, indexOfLastAlert);
    const totalAlertPages = Math.ceil(alerts.length / itemsPerPage);

    const paginate = (pageNumber: number, setPage: (page: number) => void) => {
        setPage(pageNumber);
    };

    const renderPagination = (
        currentPage: number,
        totalPages: number,
        setPage: (page: number) => void
    ) => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination">
                <button
                    onClick={() => paginate(currentPage - 1, setPage)}
                    disabled={currentPage === 1}
                    className="page-button"
                >
                    &laquo;
                </button>

                {startPage > 1 && (
                    <>
                        <button onClick={() => paginate(1, setPage)} className="page-button">1</button>
                        {startPage > 2 && <span className="ellipsis">...</span>}
                    </>
                )}

                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => paginate(number, setPage)}
                        className={`page-button ${currentPage === number ? 'active' : ''}`}
                    >
                        {number}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="ellipsis">...</span>}
                        <button onClick={() => paginate(totalPages, setPage)} className="page-button">
                            {totalPages}
                        </button>
                    </>
                )}

                <button
                    onClick={() => paginate(currentPage + 1, setPage)}
                    disabled={currentPage === totalPages}
                    className="page-button"
                >
                    &raquo;
                </button>
            </div>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
            </div>

            <section className="dashboard-section">
                <h2>
                    Requests <span>{requests.length} total</span>
                </h2>

                {requests.length > 0 ? (
                    <>
                        <div className="card-container">
                            {currentRequests.map((req) => (
                                <div key={req.id} className="card">
                                    <h3>{req.title}</h3>
                                    <p className="description">{req.description}</p>
                                    <div className="meta-info">
                                        <span className={`tag type-${req.type}`}>{req.type}</span>
                                        <span className={`tag status-${getDisplayStatus(req)}`}>
                                            {getDisplayStatus(req)}
                                        </span>
                                    </div>
                                    <p className="meta-date">Created: {formatDate(req.createdAt)}</p>
                                    <div className="card-actions">
                                        {req.status_admin === "pending" && (
                                            <>
                                                <button className="btn btn-success" onClick={() => handleApprove(req.id, req.type, req.status_doyen)}>Approve</button>
                                                <button className="btn btn-danger" onClick={() => handleReject(req.id)}>Reject</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {renderPagination(currentRequestPage, totalRequestPages, setCurrentRequestPage)}
                    </>
                ) : (
                    <div className="empty-state">
                        <p>No requests found</p>
                    </div>
                )}
            </section>

            <section className="dashboard-section">
                <h2>
                    Alerts <span>{alerts.length} total</span>
                </h2>

                {alerts.length > 0 ? (
                    <>
                        <div className="card-container">
                            {currentAlerts.map((alert) => (
                                <div key={alert.id} className="card">
                                    <h3>{alert.title}</h3>
                                    <p className="description">{alert.description}</p>
                                    <div className="meta-info">
                                        <span className={`tag type-${alert.type}`}>{alert.type}</span>
                                    </div>
                                    <p className="meta-date">Created: {formatDate(alert.createdAt)}</p>
                                    <div className="card-actions">
                                        <button className="btn btn-primary">View Details</button>
                                        <button className="btn btn-danger" onClick={() => handleDismiss(alert.id)}>Dismiss</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {renderPagination(currentAlertPage, totalAlertPages, setCurrentAlertPage)}
                    </>
                ) : (
                    <div className="empty-state">
                        <p>No alerts found</p>
                    </div>
                )}
            </section>
        </div>
    );
}
