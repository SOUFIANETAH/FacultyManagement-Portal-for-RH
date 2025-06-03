"use client";
import { useEffect, useState } from "react";
import "./dean.css";
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

export default function DeanDashboard() {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);
    const { data: session, status } = useSession();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        }
    }, [status, router]);

    useEffect(() => {
        setLoading(true);
        fetch("/api/requests")
            .then(async (res) => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                const data = await res.json();
                return Array.isArray(data)
                    ? data.filter((req) => req.status_doyen === "pending")
                    : [];
            })
            .then((filtered) => setRequests(filtered))
            .catch((err) => {
                console.error("Failed to fetch requests:", err);
            })
            .finally(() => setLoading(false));
    }, []);

    const handleApprove = async (id: number, type: string) => {
        try {
            const response = await fetch("/api/requests", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id,
                    approverRole: "dean",
                    status: "dean_approved",
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove the approved request from the list since we only show pending requests
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
                    approverRole: "dean",
                    status: "dean_rejected",
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

    const getDisplayStatus = (request: Request) => {
        if (request.status_doyen === "dean_approved") return "approved";
        if (request.status_doyen === "dean_rejected") return "rejected";
        return "pending";
    };

    // Helper function to get user name from request
    const getUserName = (request: Request) => {
        // Check first if there's a user object with name
        if (request.user && request.user.name) {
            return request.user.name;
        }
        // Then check userData which might have name information
        if (request.userData && request.userData.name) {
            return request.userData.name;
        }
        // If register request, userData might be in a different format
        if (request.type === "register" && request.userData) {
            try {
                // If userData is stringified JSON
                if (typeof request.userData === 'string') {
                    const data = JSON.parse(request.userData);
                    if (data.name) return data.name;
                }
            } catch (e) {
                // Ignore parsing errors
            }
        }
        return "Unknown User";
    };

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const renderPagination = () => {
        const totalPages = Math.ceil(requests.length / itemsPerPage);
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
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="page-button"
                >
                    &laquo;
                </button>
                {startPage > 1 && (
                    <>
                        <button onClick={() => paginate(1)} className="page-button">1</button>
                        {startPage > 2 && <span className="ellipsis">...</span>}
                    </>
                )}
                {pageNumbers.map((number) => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`page-button ${currentPage === number ? 'active' : ''}`}
                    >
                        {number}
                    </button>
                ))}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="ellipsis">...</span>}
                        <button onClick={() => paginate(totalPages)} className="page-button">
                            {totalPages}
                        </button>
                    </>
                )}
                <button
                    onClick={() => paginate(currentPage + 1)}
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

    const indexOfLastRequest = currentPage * itemsPerPage;
    const currentRequests = requests.slice(indexOfLastRequest - itemsPerPage, indexOfLastRequest);

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
                <h1>Dean Dashboard</h1>
            </div>

            <section className="dashboard-section">
                <h2>Requests <span>{requests.length} total</span></h2>
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
                                    <p className="requester"><strong>Requester:</strong> {getUserName(req)}</p>
                                    <p className="meta-date">Created: {formatDate(req.createdAt)}</p>
                                    <div className="card-actions">
                                        {req.status_doyen === "pending" && (
                                            <>
                                                <button className="btn btn-success" onClick={() => handleApprove(req.id, req.type)}>Approve</button>
                                                <button className="btn btn-danger" onClick={() => handleReject(req.id)}>Reject</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {renderPagination()}
                    </>
                ) : (
                    <div className="empty-state">
                        <p>No requests found</p>
                    </div>
                )}
            </section>
        </div>
    );
}