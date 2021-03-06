/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { BAD_REQUEST, CREATED, INTERNAL_SERVER_ERROR, NO_CONTENT, SUCCESS } from "../utils/statusCodes";
import { LIMIT_FILE_SIZE, SUCCESS_MSG } from "../utils/statusMessages";
import AppError from "../utils/appError";
import { IMAGE_UPLOAD_ERROR, LIMIT_FILE_SIZE_ERROR,
     NO_IMAGE_PROVIDED,WRONG_IMG_MIME,
     NAME_PRICE_IMGURL_CATEGORY_DETAILS_REQUIRED, 
     PRODUCT_EXISTS,
     ERROR_ADDING_PRODUCT,
     ERROR_ADDING_IMAGE,
     ERROR_FETCHING_PRODUCTS,
     ERROR_FETCHING_PRODUCT,
     PRODUCT_ID_REQUIRED,
     BAD_FORMAT_ID,
     ERROR_DELETING_PRODUCT,
     ATLEAST_ONE_FIELD_REQUIRED,
     ERROR_UPDATING_PRODUCT,
     PRODUCT_NOT_EXISTS,
     SEARCH_VALUE_REQUIRED,
     ERROR_SEARCHING} from "../utils/errorMessages";
import uploadService from "../services/uploadService";
import productService from "../services/productService";
import {  PRODUCT_ADDED } from "../utils/successMessages";
import validators from "../utils/validators";
import _, { result } from 'lodash';


class ProductController{
    
    addProduct = async  (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{
            const { name, price ,imageUrl, category, details }: { name:string, price:number,imageUrl:string,category:string, details:string} = req.body;

            if(!name.trim() || !price ||!imageUrl.trim() || !category.trim() || !details.trim())
             return next(new AppError(NAME_PRICE_IMGURL_CATEGORY_DETAILS_REQUIRED,BAD_REQUEST));
             
            if(await productService.findProductByName(name) != null) return next(new AppError(PRODUCT_EXISTS,BAD_REQUEST));
            
            const newProduct = await productService.addProduct({name,price,imageUrl,category,details});

            res.status(CREATED).json({
                status: SUCCESS_MSG,
                data:{
                     message: PRODUCT_ADDED,
                     newProduct,
                }
            });

        }catch(e){
            console.log(e.message);
            return next( new AppError(ERROR_ADDING_PRODUCT,INTERNAL_SERVER_ERROR));
        }
    }

    addProductImage = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{                       
             
            uploadService.cloudinaryUploader(req,res,async (err: any)=>{                
                
                if(err) {this.uploaderError(err,next)
                //console.log(err)
                }

                else{   
                    
                 const fileName : string | undefined  = res?.req?.file?.filename;
                 
                 if(!fileName) return next(new AppError(NO_IMAGE_PROVIDED,BAD_REQUEST));                 
 
                 res.status(CREATED).json({
                     status: SUCCESS_MSG,
                     data:{                          
                          imageUrl:req.file.path,
                     }
                 });
                }
                
             });   
            

        }catch(e){
            console.log(e.message);
            return next( new AppError(ERROR_ADDING_IMAGE,INTERNAL_SERVER_ERROR));
        }
    }

    uploaderError = (err:any,next:NextFunction) =>{

        if(err.code == LIMIT_FILE_SIZE) return next(new AppError(LIMIT_FILE_SIZE_ERROR,BAD_REQUEST));
                    
        if(err.message == WRONG_IMG_MIME) return next(new AppError(WRONG_IMG_MIME,BAD_REQUEST));
                    
        return next(new AppError(IMAGE_UPLOAD_ERROR,BAD_REQUEST));
    }

    getAllProducts = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{
            const products = await productService.getAllProducts();
            
            res.status(SUCCESS).json({
                status:SUCCESS_MSG,
                data:{
                    products
                }
            });

        }catch(e){
            console.log(e.message);
            return next( new AppError(ERROR_FETCHING_PRODUCTS,INTERNAL_SERVER_ERROR));
        }
    }
    getLengthProduct = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{
            const products = await productService.getLengthProduct();
            var so_san_pham = products.length;
            res.status(SUCCESS).json({
                status:SUCCESS_MSG,
                data:{
                    so_san_pham
                }
            });

        }catch(e){
            console.log(e.message);
            return next( new AppError(ERROR_FETCHING_PRODUCTS,INTERNAL_SERVER_ERROR));
        }
    }

    getAllProductById = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{

            const productId:string = req.params.id.trim();

            if(!productId) return next(new AppError(PRODUCT_ID_REQUIRED,BAD_REQUEST));

            if(!validators.isObjectIdValid(productId)) return next( new AppError(BAD_FORMAT_ID,BAD_REQUEST));
            
            const product = await productService.findProductById(productId);
            
            res.status(SUCCESS).json({
                status:SUCCESS_MSG,
                data:{ product }
            });

        }catch(e){
            console.log(e.message);
            return next( new AppError(ERROR_FETCHING_PRODUCT,INTERNAL_SERVER_ERROR));
        }
    }

    deleteProduct = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{
            const productId:string = req.params.id.trim();

            if(!productId) return next(new AppError(PRODUCT_ID_REQUIRED,BAD_REQUEST));

            if(!validators.isObjectIdValid(productId)) return next( new AppError(BAD_FORMAT_ID,BAD_REQUEST));

            const product = await productService.findProductById(productId);
            
            if(!product) return next( new AppError(PRODUCT_NOT_EXISTS,BAD_REQUEST));

            const result = await productService.deleteProductById(productId);

            if(!result) return next( new AppError(ERROR_DELETING_PRODUCT,INTERNAL_SERVER_ERROR));

            res.status(NO_CONTENT).json({
                status:SUCCESS_MSG
            });

        }catch(e){
            console.log(e.message);
            return next( new AppError(ERROR_DELETING_PRODUCT,INTERNAL_SERVER_ERROR));
        }
    }

    updateProductById = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{

            const productId:string = req.params.id.trim();

            if(!productId) return next(new AppError(PRODUCT_ID_REQUIRED,BAD_REQUEST));

            if(!validators.isObjectIdValid(productId)) return next( new AppError(BAD_FORMAT_ID,BAD_REQUEST));

            const product = await productService.findProductById(productId);
            
            if(!product) return next( new AppError(PRODUCT_NOT_EXISTS,BAD_REQUEST));

            const { name,price,imageUrl,category,details }: { name:string,price:number,imageUrl:string , category:string, details:string} = req.body;        

            if(!name && !price && !imageUrl && !category && !details) return next(new AppError(ATLEAST_ONE_FIELD_REQUIRED,BAD_REQUEST));
            
            const dataToUpdate = _.pickBy(req.body,_.identity);

            const result = await productService.updateProduct(productId,dataToUpdate);
            
            if(!result) return next( new AppError(ERROR_UPDATING_PRODUCT,INTERNAL_SERVER_ERROR));

            res.status(SUCCESS).json({
                status: SUCCESS_MSG,
                data:{
                    updatedProduct:result
                }
            });

        }catch(e){
           console.log(e.message);
           return next( new AppError(ERROR_UPDATING_PRODUCT,INTERNAL_SERVER_ERROR));
        }
    }

    searchByNameOrCategory = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{
            const value:string = req.params.value;

            if(!value.trim()) return next(new AppError(SEARCH_VALUE_REQUIRED, BAD_REQUEST));

            const result = await productService.searchByNameOrCategory(value);

            res.status(SUCCESS).json({
                status: SUCCESS_MSG,
                data:{ result     }
            });

        }catch(e){
           console.log(e.message);
           return next( new AppError(ERROR_SEARCHING,INTERNAL_SERVER_ERROR));
        }
    }

    searchByCategory = async (req:Request,res:Response,next:NextFunction):Promise<any> =>{
        try{
            const category:string = req.params.category;

            if(!category.trim()) return next(new AppError(SEARCH_VALUE_REQUIRED, BAD_REQUEST));

            const result = await productService.searchByCategory(category);
            //console.log(result.length);

            res.status(SUCCESS).json({
                status: SUCCESS_MSG,
                data:{ result     }
            });

        }catch(e){
           console.log(e.message);
           return next( new AppError(ERROR_SEARCHING,INTERNAL_SERVER_ERROR));
        }
    }

    getAllProductsWithPagination = async (request:Request, response:Response, next:NextFunction): Promise<any>=>{
        try{
            let page = parseInt(request.params.page) || 1;
            let limit = parseInt(request.params.limit) || 30;

            const products = await productService.getAllProductsWithPagination(page,limit);
            
            const totalNumberOfProducts = await productService.getNumberOfProducts();

            response.status(SUCCESS).json({
                status:SUCCESS_MSG,
                data:{
                    total: products[0].data.length,
                    currentPage: page,
                    pages: Math.ceil(totalNumberOfProducts / limit),
                    products: products[0].data
                }
            });


        }catch(error){
            console.log(error.message);
            return next( new AppError(ERROR_FETCHING_PRODUCTS,INTERNAL_SERVER_ERROR));
        }

    }

}

export default new ProductController();