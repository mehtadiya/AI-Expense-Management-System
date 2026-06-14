import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

function VoiceDrafts() {
    const [drafts, setDrafts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadDrafts();
    }, []);

    const loadDrafts = async () => {
        try {
            const res = await api.get("/voiceDrafts");
            setDrafts(res.data);
        } catch (err) {
            console.error(err);
        }
    };



    const handleDelete = async (id) => {
        try {
            await api.delete(`/voiceDrafts/${id}`);
            loadDrafts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddAll = () => {
        const formatted = drafts.map(d => ({
            category: d.category,
            expenseAmount: d.expenseamount,
            note: d.note,
            expenseDate: d.expensedate,
            categoryID: d.categoryid
        }));

        navigate("/main/multiple", { state: { voiceData: formatted } });
    };

    return (
        <div className="container mt-4">
            <h3>Voice Draft Expenses</h3>

            {drafts.length === 0 ? (
                <p>No draft expenses found</p>
            ) : (
                <table className="table table-bordered">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Note</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {drafts.map((d) => (
                            <tr key={d.draftid}>
                                <td>{d.category}</td>
                                <td>{d.note}</td>
                                <td>₹{d.expenseamount}</td>
                                <td>{d.expensedate?.split("T")[0]}</td>
                                <td>
                                    <button
  className="btn btn-sm"
  style={{
    border: "1px solid red",
    color: "red",
    background: "transparent",
  }}
  onClick={() => handleDelete(d.draftid)}
  title="Delete"
>
  <i className="bi bi-trash3"></i>
</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            
           
            <button className="btn btn-success" onClick={handleAddAll}>
                Review & Add Expenses
            </button>
        </div>
    );
}

export default VoiceDrafts;