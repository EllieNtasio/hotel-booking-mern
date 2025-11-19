import { response } from "express";
import Booking from "../models/Booking.js"
import Room from "../models/Room.js";
import Hotel from "../models/Hotel.js";



//Room Availability

const checkAvailability = async({checkInDate, checkOutDate, room})=>{
    try {
        const bookings = await Booking.find({
            room,
            checkInDate: {$lte: checkOutDate},
            checkOutDate: {$gte: checkInDate},
        });

        const isAvailable = bookings.length === 0;
        return isAvailable;
        
    } catch (error) {
        console.error(error.message);
    }
}

//API for Availability check
// POST /api/bookings/check-availability

export const checkAvailabilityAPI = async(req, res)=>{
    try {
        const {room, checkInDate, checkOutDate} = req.body;
        const isAvailable = await checkAvailability({checkInDate, checkOutDate,room});
        res.json({success: true, isAvailable})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
};

//API for booking creation
// POST api/bookings/book

export const createBooking = async(req, res)=>{
    try {
        const {room, checkInDate, checkOutDate, guests} = req.body; 
        const user = req.user._id;

        const isAvailable = await checkAvailability({
            checkInDate,
            checkOutDate,
            room,
        });

        if (!isAvailable){
            return res.json({success: false, message: "Room is not available"})
        }
        //Get total price for room\

        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;

        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 3600 *24));

        totalPrice *= nights;
        
        const booking = await Booking.create({
            user,
            room,
            hotel: roomData.hotel._id,
            guests: +guests,
            checkInDate,
            checkOutDate,
            totalPrice,
        })

        res.json({sucess: true, message: "Booking created successfully"}) 

    } catch (error) {
        console.log(error);
        res.json({sucess: false, message: "Failed to create booking"})
    }

};

//API to get all of the users bookings

export const getUserBookings = async(req,res)=>{
   try {
    const user = req.body._id;
    const bookings = await Booking.find({user}).populate("room hotel").sort({
        createdAt: -1
    });
    res.json({success: true, bookings})
   } catch (error) {
    res.json({sucess: false, message: "Failed to fetch bookings"})
   }
}

export const getHotelBookings = async(req, res)=>{
    try {
        const hotel = await Hotel.findOne({owner: req.auth.userId});
    if(!hotel){
       return res.json({sucess: false, message: "No hotel found"}); 
    }

    const bookings = await Booking.find({hotel: hotel._id}).populate("room hotel").sort({
        createdAt: -1
    });

    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((acc, booking)=>acc + booking.totalPrice, 0)

    res.json({success: true, dashboardData: {totalBookings, totalRevenue, bookings}})

    } catch (error) {
        res.json({success: false, message: "Failed to fetch bookings"}) 
    }

}
