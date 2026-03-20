import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../api/api";
import { useAuth } from "../context/AuthProvider";

function CategoryPage() {
  const [categories, setCategory] = useState([]);
  const [icons, setIcons] = useState([]);
  const user=useAuth()
  const userID=user?.userID;

  useEffect( ()=>{
    api.get(`/icons`)
   .then(res=>setIcons(res.data))
  },[])
  console.log("icons",icons)
 

  // Fetch categories
useEffect( () => {
         api.get("/categories")
            .then(res => setCategory(res.data))
            .catch((err) => console.error("Error fetching categories:", err));

    }, []);

  // Edit category handler
  const handleEdit = (data) => {
     const iconOptions = icons
    .map(
      (icon) => `
        <option 
          value="${icon.iconID}" 
          ${data.iconID === icon.iconID ? "selected" : ""}
        >
         ${icon.icon} 
        </option>`
    )
    .join("");
    Swal.fire({
      title: "Edit Category",
      html: `
  <div style="text-align:left;">
    <div class="mb-3">
      <label class="form-label fw-semibold" style="display:block; margin-bottom:5px;">Category Name</label>
      <input id="category" type="text" class="swal2-input" 
        style="width:90%; margin:0;" 
        value="${data.category}" 
        placeholder="Enter category name" />
    </div>

    <div class="mb-3">
      <label class="form-label fw-semibold" style="display:block; margin-bottom:5px;">Select Icon</label>
      <select id="iconID" class="swal2-select" style="width:90%; margin:0;">
        ${iconOptions}
      </select>
    </div>
  </div>
`,

      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Update",
      preConfirm: () => {
        const category = document.getElementById("category").value;
        const iconID = document.getElementById("iconID").value;

        if (!category || !iconID) {
          Swal.showValidationMessage("Please fill out all fields");
          return false;
        }

        return { category, iconID };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const updated = result.value;
        await api.put(`categories/${data.categoryID}`,{
          category:updated.category,
          iconID:updated.iconID
        })
       
          Swal.fire("Updated!", "Category updated successfully!", "success")
          .then(() => window.location.reload())

          .catch((err) => {
            console.error("Error updating category:", err);
            Swal.fire("Error", "Server error occurred", "error");
          });
      }
    });
  };

  // Delete category handler
  const handleDelete = (data) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This category and all related expenses will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        api.delete(`/categories/${data.categoryID}`)
       
          .then(() => {
            Swal.fire("Deleted!", "Category deleted successfully with all the expenses.", "success").then(
                () => window.location.reload()
              );
          })
          .catch((err) => {
            console.error("Error deleting category:", err);
            Swal.fire("Error", "Server error occurred.", "error");
          });
      }
    });
  };

 const handleAdd = () => {
  const iconOptions = `
  <option value="">-- Select an icon --</option>
  ${icons
    .map(
      (icon) => `
        <option value="${icon.iconID}">
          <i className="bi bi-eye">${icon.icon}</i>
        </option>`
    )
    .join("")}
`;

  Swal.fire({
    title: "Add Category",
    html: `
      <div style="text-align:left;">
        <div class="mb-3">
          <label class="form-label fw-semibold" style="display:block; margin-bottom:5px;">Category Name</label>
          <input id="category" type="text" class="swal2-input"
            style="width:90%; margin:0;"
            placeholder="Enter category name" />
        </div>

        <div class="mb-3">
          <label class="form-label fw-semibold" style="display:block; margin-bottom:5px;">Select Icon</label>
          <select id="iconID" class="swal2-select" style="width:90%; margin:0;">
            ${iconOptions}
          </select>
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Add",
    preConfirm: () => {
      const category = document.getElementById("category").value;
      const iconID = document.getElementById("iconID").value;

      if (!category || !iconID) {
        Swal.showValidationMessage("Please fill out all fields");
        return false;
      }
      console.log("iconID",iconID);
      return { category, iconID };
    },
  }).then(async (result) => {
    if (result.isConfirmed) {

      const newCategory = result.value;

      await api.post(`categories/add`,{
        category:newCategory.category,
        iconID:newCategory.iconID
      })
      .then(() => {
           Swal.fire("Added!", "Category added successfully!", "success").then(
              () => window.location.reload()
            );
        })
        .catch((err) => {
          console.error("Error adding category:", err);
          Swal.fire("Error", "Server error occurred", "error");
        });
    }
  });
};


  return (
    <div className="container-fluid py-3">
      <div className="row">
        <div className="col-9">
          <h2 className="fw-bolder" style={{ color: "#0A382B" }}>
            Your Categories
          </h2>
        </div>
        <div className="col d-flex justify-content-end me-1 align-items-center">
         
            <button
            onClick={handleAdd}
              type="button"
              className="btn btn-success px-4 py-2"
              style={{
                borderRadius: "12px",
                fontWeight: "600",
                boxShadow: "0 4px 15px rgba(72, 187, 120, 0.3)",
              }}
            >
              <i className="bi bi-plus-circle me-2"></i>Add Category
            </button>
          
        </div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4 mt-3">
        {categories.map((data) => (
          <div className="col" key={data.categoryID}>
            <div
              className="card text-center shadow-sm border-0 p-4"
              style={{
                borderRadius: "20px",
                backgroundColor: "white",
                transition: "all 0.3s ease",
              }}
            >
              <div
                className="icon-wrapper mx-auto mb-3 d-flex justify-content-center align-items-center"
                style={{
                  backgroundColor: "white",
                  border: `1px solid ${data.color}`,
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  fontSize: "24px",
                }}
              >
                <i className={data.icon} style={{ color: `${data.color}` }}></i>
              </div>
              <h6 className="fw-semibold" style={{ color: "#0A382B" }}>
                {data.category}
              </h6>
              <div className="d-flex justify-content-center gap-2 mt-2">
                <button
                  className="btn btn-sm btn-outline-warning"
                  title="Edit"
                  onClick={() => handleEdit(data)}
                >
                  <i className="bi bi-pencil-square"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  title="Delete"
                  onClick={() => handleDelete(data)}
                >
                  <i className="bi bi-trash3"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CategoryPage;
