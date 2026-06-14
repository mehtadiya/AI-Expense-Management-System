import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";

function Multiple() {
  const location = useLocation();
  const voiceData = location.state?.voiceData || [];
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  const defaultRow = {
    categoryID: "",
    note: "",
    expenseAmount: "",
    expenseDate: new Date().toISOString().split("T")[0],
  };

  const [forms, setForms] = useState(
    Array(3).fill().map(() => ({ ...defaultRow }))
  );

  useEffect(() => {
    api.get("/categories")
      .then((res) => {
        setCategories(res.data);

        if (voiceData.length > 0) {
  const rows = voiceData.map((v) => {
    const cat = res.data.find(
      (c) =>
        c.category.toLowerCase() === v.category.toLowerCase()
    );

    return {
      categoryID: cat ? cat.categoryID : v.categoryID,
      note: v.note || "",
      expenseAmount: v.expenseAmount || v.expenseamount || "",
      expenseDate:
        (v.expenseDate || v.expensedate)?.split("T")[0] ||
        new Date().toISOString().split("T")[0],
    };
  });

  setForms(rows);
}
      })
      .catch((err) => console.error(err));
  }, [voiceData]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const updated = [...forms];
    updated[index][name] = value;
    setForms(updated);
  };

  const handleAddRow = () => {
    setForms([...forms, { ...defaultRow }]);
  };

  const handleDeleteRow = (index) => {
    setForms(forms.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    try {
      const validExpenses = forms.filter(
        (r) =>
          r.categoryID &&
          r.note &&
          r.expenseAmount &&
          r.expenseDate
      );

      if (validExpenses.length === 0) {
        Swal.fire("Warning", "Please fill at least one expense row", "warning");
        return;
      }

      await api.post("/expenses/add-multiple", {
        expenses: validExpenses,
      });

      Swal.fire("Success", "Expenses Added!", "success").then(() => {
        navigate("/main/expenses");
      });
    } catch (err) {
      Swal.fire("Error", "Failed to add expenses", "error");
    }
  };

  return (
    <div className="container-fluid p-2 m-2">
      <h3 className="text-center mb-4">Add Multiple Expenses</h3>

      <div className="table-responsive">
        <table className="table table-bordered text-center">
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
            {forms.map((form, i) => (
              <tr key={i}>
                <td>
                  <select
                    name="categoryID"
                    value={form.categoryID}
                    onChange={(e) => handleChange(e, i)}
                    className="form-select"
                  >
                    <option value="">Select</option>
                    {categories.map((c) => (
                      <option key={c.categoryID} value={c.categoryID}>
                        {c.category}
                      </option>
                    ))}
                  </select>
                </td>

                <td>
                  <input
                    name="note"
                    value={form.note}
                    onChange={(e) => handleChange(e, i)}
                    className="form-control"
                  />
                </td>

                <td>
                  <input
                    name="expenseAmount"
                    value={form.expenseAmount}
                    onChange={(e) => handleChange(e, i)}
                    className="form-control"
                  />
                </td>

                <td>
                  <input
                    type="date"
                    name="expenseDate"
                    value={form.expenseDate}
                    onChange={(e) => handleChange(e, i)}
                    className="form-control"
                  />
                </td>

                <td>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteRow(i)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-outline-success" onClick={handleAddRow}>
          Add Row
        </button>

        <button className="btn btn-success" onClick={handleSubmit}>
          Add All
        </button>
      </div>
    </div>
  );
}

export default Multiple;