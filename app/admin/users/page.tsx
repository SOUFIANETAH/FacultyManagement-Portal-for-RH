"use client";
import { useEffect, useState } from "react";
import "./GU.css";
import {FaSearch} from "react-icons/fa";
interface User {
    id: number;
    email: string;
    name?: string | null;
    role: string;
    isConfirmed?: boolean;
}

export default function GestionUtil() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRoles, setSelectedRoles] = useState<{ [key: number]: string }>({});

    const itemsPerPage = 5;
    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/users`);
                if (!response.ok) {
                    throw new Error("Failed to fetch users");
                }
                const data = await response.json();
                setUsers(Array.isArray(data) ? data : []);
            } catch (error) {
                setError(error as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const term = searchTerm.toLowerCase();
        return (
            user.id.toString().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.name?.toLowerCase().includes(term) ?? false)
        );
    });

    const indexOfLastUser = currentPage * itemsPerPage;
    const indexOfFirstUser = indexOfLastUser - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);


    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleDelete = async (id: number) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (confirmDelete) {
            try {
                const response = await fetch(`/api/users/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete user");
                setUsers(users.filter(user => user.id !== id));
                setStatusMessage({ text: "User deleted successfully", type: "success" });
            } catch (error) {
                setError(error as Error);
                setStatusMessage({ text: `Error: ${(error as Error).message}`, type: "error" });
            } finally {
                setTimeout(() => setStatusMessage(null), 3000);
            }
        }
    };

    const handleRole = async (id: number, newRole: string) => {
        try {
            const response = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (!response.ok) throw new Error("Failed to update role");
            const updatedUser = await response.json();
            setUsers(prev =>
                prev.map(user =>
                    user.id === id ? { ...user, role: updatedUser.role } : user
                )
            );
            setStatusMessage({ text: "Role updated successfully", type: "success" });
        } catch (error) {
            setError(error as Error);
            setStatusMessage({ text: `Error: ${(error as Error).message}`, type: "error" });
        } finally {
            setTimeout(() => setStatusMessage(null), 3000);
        }
    };



    const renderPageNumbers = () => {
        if (totalPages <= 1) return null;

        const pageNumbers = [];
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
            endPage = Math.min(totalPages, startPage + 4);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return (
            <div className="pagination">
                <button onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>&laquo;</button>

                {startPage > 1 && (
                    <>
                        <button onClick={() => paginate(1)}>1</button>
                        {startPage > 2 && <span>...</span>}
                    </>
                )}

                {pageNumbers.map(number => (
                    <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={currentPage === number ? "active" : ""}
                    >
                        {number}
                    </button>
                ))}

                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span>...</span>}
                        <button onClick={() => paginate(totalPages)}>{totalPages}</button>
                    </>
                )}

                <button onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>&raquo;</button>
            </div>
        );
    };

    if (loading) return <div className="admin-dashboard"><div>Loading...</div></div>;
    if (error && !statusMessage) return <div className="admin-dashboard"><div>Error: {error.message}</div></div>;

    return (
        <div className="admin-dashboard">
            <h1 className="dashboard-title">Gestion Des utilisateurs</h1>

            {statusMessage && (
                <div className={`status-message ${statusMessage.type}`}>
                    {statusMessage.text}
                </div>
            )}

            <section className="user-section">
                <h2 className="user-section-title">
                    Utilisateurs <span className="user-count">({users.length} total)</span>
                </h2>

                {users.length === 0 ? (
                    <div className="no-users">No users found.</div>
                ) : (
                    <>
                        <div className="table-header-actions">
                            <input
                                type="text"
                                placeholder="Search by ID, email, name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                            <FaSearch className="search-icon" />
                        </div>
                        <table className="user-table">
                            <thead>
                            <tr>
                                <th className="table-header">ID</th>
                                <th className="table-header">Name</th>
                                <th className="table-header">Email</th>
                                <th className="table-header">Role</th>
                                <th className="table-header">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {currentUsers.map((user) => (
                                <tr key={user.id} className="table-row">
                                    <td className="table-cell">{user.id}</td>
                                    <td className="table-cell">{user.name || '-'}</td>
                                    <td className="table-cell">{user.email}</td>
                                    <td className="table-cell">
                                        <select
                                            value={user.role}
                                            onChange={(e) =>{
                                                setSelectedRoles(prev => ({ ...prev, [user.id]: e.target.value }))
                                            }}
                                            className="role-select"
                                        >
                                            <option value="dean">Doyen</option>
                                            <option value="admin">Admin</option>
                                            <option value="Vicedean">Vice Doyen</option>
                                            <option value="administration">Administration</option>
                                        </select>
                                    </td>
                                    <td className="table-cell action-buttons">
                                        <button
                                            onClick={() => handleRole(user.id,selectedRoles[user.id]??user.role)}
                                            className={user.isConfirmed ? "confirmed-btn" : "confirm-btn"}
                                            disabled={user.isConfirmed}
                                        >
                                            {user.isConfirmed ? "Confirmed ✅" : "Confirm"}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user.id)}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        {renderPageNumbers()}
                    </>
                )}
            </section>
        </div>
    );

}
