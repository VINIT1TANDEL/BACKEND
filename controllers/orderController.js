const Order=require("../models/orderModel");
const Product =require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError=require("..//middleware/catchAsyncErrors");

//creat new order
exports.newOrder=catchAsyncError(async(req,res,next)=>{

    const { shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice}=req.body;
    const order=await Order.create({
        shippingInfo,orderItems,paymentInfo,itemsPrice,taxPrice,shippingPrice,totalPrice,paidAt:Date.now(),user:req.user._id,

    });
    res.status(201).json({
        succes:true,
        order,
    });
})

//get single order
exports.getSingleOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id).populate("user","name email"); //Orders Collection:Document 1: { _id: "order1", user: "user1", totalAmount: 50.00 }Users Collection:Document 1: { _id: "user1", name: "John Doe", email: "johndoe@example.com" }When you run the Order.findById(req.params.id).populate("user", "name email") query with an Order ID like "order1", the result will be: { _id: "order1", user: { _id: "user1", name: "John Doe", email: "johndoe@example.com" }, totalAmount: 50.00 }

    if(!order){
        return next(new ErrorHandler("Order not found with This id",404));
    }
    res.status(201).json({
        succes:true,
        order,
    });
})

exports.myOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find({user:req.user._id});
    res.status(201).json({
        succes:true,
        orders,
    });
})

//get all order(admin)
exports.getAllOrders=catchAsyncError(async(req,res,next)=>{
    const orders=await Order.find();
    let totalAmount=0;
    orders.forEach((order)=>{
        totalAmount+=order.totalPrice;

    })
    res.status(201).json({
        succes:true,
        orders,
        totalAmount
    });
})

//update order status(admin)
exports.updateOrder=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found with This id",404));
    }
    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("You have already delivered this order",400))
    }
    if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
          await updateStock(o.product, o.quantity);
        });
      }
   order.orderStatus=req.body.status;
   if(req.body.status="Delivered"){

   order.deliveredAt=Date.now() ;
}
await order.save({validateBeforeSave:false})
    res.status(201).json({
        succes:true,    
    });
})

async function updateStock(id,quantity){
    const product= await Product.findById(id);
    product.Stock-=quantity;
    await product.save({ validateBeforeSave:false});
}

//delete order status(admin)
exports.deleteOrders=catchAsyncError(async(req,res,next)=>{
    const order=await Order.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with This id",404));
    }
    await order.deleteOne();
    res.status(201).json({
        succes:true,
        
    });
})

