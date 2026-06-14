import { useState } from "react";
import Swal from "sweetalert2";
const API = process.env.REACT_APP_PYTHON_APP_API_URL;

function Scan() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleScan = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("receipt", image);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API}/scan-receipt`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {

  await Swal.fire({
    icon: "success",
    title: "Receipt Scanned!",
    text: `${data.count} expenses added successfully.`,
    timer: 2000,
    showConfirmButton: false
  });

  setImage(null);
  setPreview(null);

} else {

  Swal.fire({
    icon: "error",
    title: "Oops...",
    text: data.message || data.error
  });

}
    }
    catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Scan Receipt</h2>

      <div className="card p-4 shadow-sm">
        <input
          type="file"
          accept="image/*"
          className="form-control"
          onChange={handleImageChange}
        />

        {preview && (
          <div className="mt-4 text-center">
            <img
              src={preview}
              alt="Receipt Preview"
              className="img-fluid rounded"
              style={{
                maxHeight: "400px",
                border: "1px solid #ddd",
              }}
            />
          </div>
        )}

        <div className="mt-4 text-center">
          <button
            className="btn btn-success"
            disabled={!image || loading} onClick={handleScan}
          >
            {loading ? "Scanning..." : "Scan Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Scan;