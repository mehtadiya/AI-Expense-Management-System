import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";
import { useLocation } from "react-router-dom";

function Multiple() {
  const location = useLocation();
  const voiceData = location.state?.voiceData || [];
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const defaultRow = { categoryID: "", note: "", expenseAmount: "", expenseDate: new Date().toISOString().split("T")[0] };
  const [forms, setForms] = useState(Array(3).fill().map(() => ({ ...defaultRow })));

  // Fetch categories

  useEffect(() => {
  api.get("/categories")
    .then(res => {
      setCategories(res.data);

      if (voiceData.length > 0) {

        const rows = voiceData.map(v => {

          const cat = res.data.find(
            c => c.category.toLowerCase() === v.category.toLowerCase()
          );

          return {
            categoryID: cat ? cat.categoryID : "",
            note: v.category,
            expenseAmount: v.amount,
            expenseDate: new Date().toISOString().split("T")[0]
          };

        });

        setForms(rows);
      }

    })
    .catch((err) => console.error("Error fetching categories:", err));
}, []);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updatedForms = [...forms];
    updatedForms[index][name] = value;
    setForms(updatedForms);
  };

  // Add a new empty row
  const handleAddRow = () => {
    setForms([...forms, { ...defaultRow }]);
  };

  //  Delete a row
  const handleDeleteRow = (index) => {
    const updated = forms.filter((_, i) => i !== index); //keep all except the one to delete
    setForms(updated);
  };


  const handleSubmit = async () => {
    try {
      const validExpenses = forms.filter((row) =>
        row.categoryID &&
        row.note &&
        row.expenseAmount &&
        row.expenseDate
      );
      if (validExpenses.length === 0) {
        Swal.fire({
        icon:  "warning",
        title:  "Warning",
        text:  "Please fill at least one expense row",
        confirmButtonColor: "#f0ad4e",
        confirmButtonText: "OK"
      });
        return;
      }


      await api.post("/expenses/add-multiple", { expenses: validExpenses }).then(res => setForms(res.data))


      Swal.fire({
        icon: "success",
        title: "Expenses Added!",
        text: " All expenses have been added successfully.",
        confirmButtonColor: "#3085d6",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/main/expenses`); // navigate after clicking OK
      });




    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to add expenses",
        "error"
      );
    }
  };

  return (
    <div
      className="container-fluid p-2 m-2"
      style={{
        background: "#F0FFF0",
        borderRadius: "20px",
        width: "99%",
      }}
    >
      <h3 className="text-center mb-4 fw-bold" style={{ color: "#0A382B" }}>
        Add Multiple Expenses
      </h3>

      <div className="table-responsive">
        <table className="table table-bordered align-middle text-center shadow-sm">
          <thead
            style={{
              backgroundColor: "#198754",
              color: "white",
              borderRadius: "12px",
            }}
          >
            <tr>
              <th style={{ width: "25%" }}>Category</th>
              <th style={{ width: "25%" }}>Note</th>
              <th style={{ width: "20%" }}>Amount (₹)</th>
              <th style={{ width: "20%" }}>Date</th>
              <th style={{ width: "10%" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {forms.length > 0 ? (
              forms.map((form, i) => (
                <tr key={i}>
                  <td>
                    <select
                      name="categoryID"
                      value={form.categoryID}
                      onChange={(e) => handleChange(e, i)}
                      className="form-select border-0 shadow-sm bg-light"
                    >
                      <option value="">Select</option>
                      {categories.length > 0 ? (
                        categories.map((data) => (
                          <option key={data.categoryID} value={data.categoryID}>
                            {data.category}
                          </option>
                        ))
                      ) : (
                        <p>No result found</p>
                      )}

                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="note"
                      value={form.note}
                      onChange={(e) => handleChange(e, i)}
                      className="form-control border-0 shadow-sm bg-light"
                      placeholder="Note"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="expenseAmount"
                      value={form.expenseAmount}
                      onChange={(e) => handleChange(e, i)}
                      className="form-control border-0 shadow-sm bg-light"
                      placeholder="Amount"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="expenseDate"
                      value={form.expenseDate}
                      onChange={(e) => handleChange(e, i)}
                      className="form-control border-0 shadow-sm bg-light"
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle"
                      title="Delete Row"
                      onClick={() => handleDeleteRow(i)}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <p>No results found</p>
            )}

          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button
          onClick={handleAddRow}
          className="btn btn-outline-success d-flex align-items-center"
          style={{
            borderRadius: "12px",
            fontWeight: "600",
            boxShadow: "0 4px 15px rgba(72, 187, 120, 0.3)",
          }}
        >
          <i className="bi bi-plus-circle me-2"></i> Add Row
        </button>

        <button
          className="btn btn-success px-4 py-2 fw-semibold"
          onClick={handleSubmit}
          style={{
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(72, 187, 120, 0.3)",
          }}
        >
          Add All
        </button>
      </div>
    </div>
  );
}

export default Multiple;


