import {v2 as cloudinary} from "cloudinary";
import Hotel from "../models/Hotel.js";
import Room from "../models/Room.js";

//New Room
export const createRoom = async(req, res)=>{
   try {
     const {roomType, pricePerNight, amenities} = req.body;
     const hotel = await Hotel.findOne({owner: req.auth.userId})

     if (!hotel) return res.json({success: false, message: "No Hotel found"});

     const uploadImages = req.files.map(async(file)=>{
        const response = await cloudinary.uploader.upload(file.path);
        return response.secure_url;
     })
 
    const images = await Promise.all(uploadImages)
    await Room.create({
        hotel: hotel._id,
        roomType,
        pricePerNight: +pricePerNight,
        amenities: JSON.parse(amenities),
        images,
    })
    res.json({success: true, message: "Room created successfully!"})
   } catch (error){
    res.json({success: false, message: error.message})
   }
}

export const getRooms = async(req, res)=>{

}

export const getOwnerRooms = async(req, res)=>{

}


export const toggleRoomAvailability = async(req, res)=>{

}