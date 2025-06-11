"use client";
import Loader from "@/components/loader";
import { Children, createContext, useContext, useEffect } from "react";
import { useState  } from "react";


interface AppUtilsType {
  isLoggedIn: boolean;
  setIsLoggedIn:(state:boolean)=>void;
  setAuthToken: (state:null)=>void;
  userProfile:null;
  setUserProfile:(state:null)=>void;
  setIsLoading:(state:boolean)=>void
  
}
const AppUtilsContext = createContext<AppUtilsType | undefined>(undefined);
export const AppUtilsProvider = ({
  Children,
}: {
  Children: React.ReactNode;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [authToken, setAuthToken]=useState<null | string>(null);
  const [userProfile, setUserProfile]= useState<null>(null);
  const [isLoading, setIsLoading]= useState(false);
 
  useEffect(()=>{
    const token=localStorage.getItem("access_token");
    const userProfile=localStorage.getItem("user_Profile")
    if(token){
      setAuthToken(token);
      setIsLoggedIn(true);
      setUserProfile( JSON.parse(userProfile));
    }
    
  },[]);
  return (
    <AppUtilsContext.Provider value={{ isLoggedIn, setAuthToken, setIsLoggedIn, userProfile, setUserProfile , setIsLoading,}}>
      {isLoading ? <Loader /> : Children}
    </AppUtilsContext.Provider>
  );
};
export const myAppHook = () => {
  const context = useContext(AppUtilsContext);
  if (!context) {
    throw new Error("App Utils functions must be wrapped in AppUtilsProvider");
  }
  return context;
};
 