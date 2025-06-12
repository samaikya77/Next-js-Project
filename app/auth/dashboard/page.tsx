"use client";
import Image from "next/image";
import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/SupabaseClient";
import { myAppHook } from "@/context/AppUtils";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as yup from "yup";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Swal from "sweetalert2";


interface ProductType {
  id?: number;
  title: string;
  content: string;
  cost: string;
  banner_image?: string | File | null;
}
 

const formSchema = yup.object().shape({
  title: yup.string().required("Product is required"),
  content: yup.string().required("Description is required"),
  cost: yup.string().required("Product cost is required"),
});

export default function DashboardPage() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [editId, setEditId]=useState<null | number>(null); // for edit product
  
  
 

  const { setAuthToken, setIsLoggedIn, isLoggedIn, setUserProfile, setIsLoading, } =
    myAppHook();
  const router = useRouter();

  //resolver for form validation
  const {
    register,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductType>({
    resolver: yupResolver(formSchema),
  });

  //fetch products
    //user is logged in , after login we will fetch the userid , pass the userid to function that function will fetch the produts from table
    const fetchProductFromTable=async (userId: string) =>{
    setIsLoading(true);
      const {data}=await supabase.from("Products").select("*").eq("user_id", userId)
      if(data){
        setProducts(data as ProductType[]);
      }else{
        setProducts([])

      }
      setIsLoading(false);
    }; 

  useEffect(() => {
    const handleLoginSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        toast.error("Failed to get user data");
        router.push("/auth/login");
        return;
      }
      setIsLoading(true);
      if (data.session?.access_token) {
        console.log(data);
        setAuthToken(data.session?.access_token);
        setUserId(data.session?.user.id);
        localStorage.setItem("access_token", data.session?.access_token);
        setIsLoggedIn(true);
        //toast.success("Logged in successfully");
        setUserProfile({
          name: data.session?.user?.user_metadata.displayName,
          email: data.session?.user?.user_metadata.email,
          phone: data.session?.user?.user_metadata.phone,
          gender: data.session?.user?.user_metadata.gender,
        });
        localStorage.setItem(
          "user_profile",
          JSON.stringify({
            name: data.session?.user?.user_metadata.displayName,
            email: data.session?.user?.user_metadata.email,
            phone: data.session?.user?.user_metadata.phone,
            gender: data.session?.user?.user_metadata.gender,
          })
        );
        //fetch products
        fetchProductFromTable(data.session.user.id);
        
      }
      setIsLoading(false);
    };
    handleLoginSession();
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
  },[]);
  //function to upload image file to supabase storage
  const uploadImageFile= async (file:File)=>{
    
    const fileExtension=file.name.split(".").pop()
    const fileName=`${Date.now()}.${fileExtension}`; //banner.jpg =>jpg
    const {error}= await supabase.storage
    .from("product-image")
    .upload (fileName, file);
    if(error){
    
      toast.error("Failed to upload  banner image")
      return null;
    }
    return supabase.storage.from("product-image").getPublicUrl(fileName).data
    .publicUrl;
   }

 // form submission handler
  const onFormSubmit = async (formData: ProductType) => {
    setIsLoading(true);
     let imagePath=formData.banner_image;
     // console.log("Form Data:", formData);
    if(formData.banner_image instanceof File){
      imagePath= await uploadImageFile(formData.banner_image);
      if(!imagePath)
        return;
      
      }
      if(editId){
        //edit operation
        const {error}= await supabase.from("Products").update({
          ...formData,
          banner_image:imagePath,       
        }).match ({id:editId, user_id:userId});
        if(error){
          toast.error("Failed to update Product")
        } else {
          toast.success("Successfully Product has been updated")
        }
      } else {
        //add opeartion
        const {error} = await supabase
          .from("Products")
          .insert({...formData, user_id:userId, banner_image:imagePath, });
   
        if(error){
          toast.error("Failed to Add Product");
          return;
        } else {
          toast.success("Product addedd successfully");
        }
        reset();
      } 
    
    
       
      setPreviewImage(null); //reset the form 
      fetchProductFromTable(userId!);
      setIsLoading(false);
    };
    
    //handle edit data
    const handleEditData= async (product:ProductType)=>{
      setValue("title", product.title);
      setValue("content", product.content ?? "");
      setValue("cost", product.cost ?? "");
      setPreviewImage(typeof product.banner_image === "string" ? product.banner_image:null)
      setEditId(product.id!);


    } 
    //delete product operation
    const handleDeleteProduct=async (id:number) =>{
      Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const {error } = await supabase.from("Products").delete().match({
          id: id,
          user_id: userId,
        });

        if (error) {
          toast.error("Failed to delete product");
        } else {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
          fetchProductFromTable(userId!);
        }
      }
    });
  };

    
    return (
    <>
      <Nav />
      <div className="container mt-5">
        <div className="row">
          <div className="col-md-5">
            <h3>{editId? "Edit Product" : "Add Product"}</h3>
            <form onSubmit={handleSubmit(onFormSubmit)}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  type="text"
                  className="form-control"
                  {...register("title")}
                />
                <small className="text-danger">{errors.title?.message}</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Content</label>
                <textarea
                  className="form-control"
                  {...register("content")}
                ></textarea>
                <small className="text-danger">{errors.content?.message}</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Cost</label>
                <input
                  type="number"
                  className="form-control"
                  {...register("cost")}
                />
                <small className="text-danger">{errors.cost?.message}</small>
              </div>
              <div className="mb-3">
                <label className="form-label">Banner Image</label>

                <div className="mb-2">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt="Preview"
                      id="bannerPreview"
                      width="100"
                      height="100"
                    />
                  ) : (
                    ""
                  )}
                </div>
                <input
                  type="file"
                  className="form-control"
                  onChange={(event) => {
                    if(event.target.files && event.target.files.length>0){
                    setPreviewImage(URL.createObjectURL(event.target.files[0]));
                    setValue("banner_image",event.target.files[0]) // Set the file in the form state
                    } // Set the preview image
                  }}
                />
                <small className="text-danger"></small>
              </div>
              <button type="submit" className="btn btn-success w-100">
                {editId ? "Update Product" : "Add Product"}
              </button>
            </form>
          </div>
          <div className="col-md-7">
            <h3>Product List</h3>
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Content</th>
                  <th>Cost</th>
                  <th>Banner Image</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                
                {products ? (
                  products.map((singleProduct,index)=>(
                  <tr key={index}>
                    <td>{singleProduct.title}</td>
                    <td>{singleProduct.content}</td>
                    <td>${singleProduct.cost}</td>
                    <td>
                        {singleProduct.banner_image ? (
                          <Image
                          src={
                            singleProduct.banner_image as string}
                              
                          
                            alt="Sample Product"
                            width="50"
                            height={50}
                          />
                        ) : (
                          "--"
                        )}
                      </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={()=>handleEditData(singleProduct)}>Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ marginLeft: "10px" }} 
                        onClick={()=>handleDeleteProduct(singleProduct.id!)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                  )
                )
                  
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
