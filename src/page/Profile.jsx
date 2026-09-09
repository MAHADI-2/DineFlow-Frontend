import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useEffect, useRef, useState } from "react";
import API from "../Api";
import { BACKEND_URL } from "../config";

const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = import.meta.env.VITE_API_URL || BACKEND_URL;
    return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
};

const Profile = () => {
    const { user, loading, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);
        
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  if (loading) {
      return (
          <div className="flex justify-center items-center h-[70vh]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
      );
  }

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        const res = await API.post("/profilePic", formData);

        if (res.data.status === "success") {
            updateUser(res.data.user);
            setImageFailed(false);
            alert("Profile picture uploaded successfully");
        }
    } catch (err) {
        console.error("Image upload failed:", err);
        alert("Profile picture upload failed");
    } finally {
        setUploading(false);
    }
  };

  const userAddress = user?.addresses && user.addresses.length > 0 ? (user.addresses[0].street || user.addresses[0].address || "N/A") : "N/A";
  const userPhone = user?.addresses && user.addresses.length > 0 ? user.addresses[0].phone : (user?.phone || "N/A");

  return (
      <div className="min-h-[85vh] bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
          <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              
              {/* প্রোফাইল হেডার */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-10 text-center text-white relative">
                  
                  {/* আপডেট প্রোফাইল বাটন (ডান পাশের ওপরের কোণায় সুন্দরভাবে পজিশন করা) */}
                  <button
                      onClick={() => navigate("/profile/edit")}
                      className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-xl backdrop-blur-md transition-all duration-200 flex items-center space-x-1 shadow-sm border border-white/20"
                  >
                      <span>✎</span>
                      <span>Update Profile</span>
                  </button>

                  {/* প্রোফাইল পিকচার সেকশন */}
                  <div 
                      className="relative group mx-auto w-28 h-28 cursor-pointer mt-4" 
                      onClick={() => fileInputRef.current.click()}
                  >
                      {getImageUrl(user?.profilePicture) && !imageFailed ? (
                         <img
                          src={getImageUrl(user.profilePicture)}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover border-4 border-white/30 shadow-lg"
                              onError={() => setImageFailed(true)}
                         />
                      ) : (
                          <div className="w-full h-full bg-white text-orange-500 rounded-full flex items-center justify-center text-4xl font-bold shadow-lg border-4 border-white/30">
                              {uploading ? "..." : (user?.name ? user.name.charAt(0).toUpperCase() : "U")}
                          </div>
                      )}

                      {/* হোভার করলে 'Change' টেক্সট দেখাবে */}
                      <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-white text-xs font-semibold">Change</span>
                      </div>

                      {/* হিডেন ফাইল ইনপুট ট্যাগ */}
                      <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleImageChange} 
                          accept="image/*" 
                          className="hidden" 
                      />
                  </div>

                  <h1 className="text-3xl font-bold tracking-wide mt-4">{user?.name || "User Profile"}</h1>
                  <span className="inline-block bg-white/20 text-xs px-3.5 py-1 rounded-full uppercase tracking-wider mt-2 font-semibold">
                      {user?.role || "Customer"}
                  </span>
              </div>

              {/* ইউজারের ডিটেইলস সেকশন */}
              <div className="px-8 py-10">
                  {user ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div>
                                  <p className="text-xs text-gray-400 font-medium uppercase">Full Name</p>
                                  <p className="text-gray-800 font-semibold">{user.name}</p>
                              </div>
                          </div>
                          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div>
                                  <p className="text-xs text-gray-400 font-medium uppercase">Email Address</p>
                                  <p className="text-gray-800 font-semibold text-sm">{user.email}</p>
                              </div>
                          </div>
                          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <div>
                                  <p className="text-xs text-gray-400 font-medium uppercase">Phone Number</p>
                                  <p className="text-gray-800 font-semibold">{userPhone}</p>
                              </div>
                          </div>
                          <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100 md:col-span-2">
                              <div>
                                  <p className="text-xs text-gray-400 font-medium uppercase">Delivery Address</p>
                                  <p className="text-gray-800 font-semibold text-sm leading-relaxed">{userAddress}</p>
                              </div>
                          </div>
                      </div>
                  ) : null}
              </div>

          </div>
      </div>
  );
};

export default Profile;