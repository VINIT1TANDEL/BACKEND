const express=require("express")
const {getAdminProducts, getAllProducts,createProduct,updateProduct,deleteProduct,getProductDetails, createProductReview, getProductReviews, deleteReviews } =require("../controllers/productController.js");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth.js");

const router=express.Router();

router.route("/products").get( getAllProducts);
router.route("/admin/products/new").post(isAuthenticatedUser, authorizeRoles("admin"),createProduct);
router.route("/admin/products/:id").put(isAuthenticatedUser, authorizeRoles("admin"),updateProduct).delete( authorizeRoles("admin"),isAuthenticatedUser,deleteProduct);
router.route("/products/:id").get(getProductDetails)
router.route("/review").put(isAuthenticatedUser,createProductReview);
router.route("/reviews").get(getProductReviews).delete(isAuthenticatedUser,deleteReviews);
router
  .route("/admin/products")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminProducts);

module.exports=router