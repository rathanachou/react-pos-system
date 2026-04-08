//set
export const setAccessToken  = (token:string) => {
    localStorage.setItem("accessToken" , token);

}

//get
 export const  getAccessToken =  () => {
    return localStorage.getItem("accessToken");

 } 
 //remove

 export const removeAccessToke = () => {
    localStorage.removeItem("accessToken");
 }