import React, { useEffect, useState } from 'react'
import { useLocation,useNavigate } from 'react-router-dom';
import './edit-post.css';
import {useToast} from '../../contexts/ToastService';
import { ClipLoader } from 'react-spinners';

const EditPost = () => {
    const location = useLocation();
    const { item } = location.state || {};
    const [noItemFound, setNotItemFound] = useState(false);
    const [title, setTitle] = useState(item.title);
    const [brand, setBrand] = useState(item.brand);
    const [category, setCategory] = useState(item.category);
    const [price, setPrice] = useState(item.price);
    const [description, setDescription] = useState(item.description);
    const[isLoading, setIsLoading]=useState(false);
    const {notifyWarning,notifySuccess}=useToast();
    const navigate=useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const updatedProduct = {
            productId: item.productId,
            title,
            brand,
            category,
            price,
            description,
        };

        setIsLoading(true)
        handleUpdateProduct(updatedProduct);
    };

 const handleUpdateProduct = async (updatedProductDetails) => {
        try {
            const response = await fetch(`http://localhost:5000/users/post/update-product/${updatedProductDetails.productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedProductDetails)
            });

            const result = await response.json();

            if (response.ok) {
                setIsLoading(false);
                notifySuccess("Updated !");
                navigate("/account/profile");
            } else {
                console.error('Error updating product', result.message);
            }
        } catch (error) {
            console.error('Error updating product', error);
        }
    };

    useEffect(() => {
        if (!item) setNotItemFound(true);
    })

    return (
        <div className='edit-product-item-container'>
            {!noItemFound ? (
                <form onSubmit={handleSubmit} className='edit-product-item-form'>
                    <div className='acc-title'>Edit Product Details</div>
                    <div className='edit-product-input-box'>
                        <label className='edit-product-label'>Title:</label>
                        <input
                            className='edit-product-input-field'
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className='edit-product-label'>Brand:</label>
                        <input
                            className='edit-product-input-field'
                            type="text"
                            value={brand}
                            onChange={(e) => setBrand(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className='edit-product-label'>Category:</label>
                        <input
                            className='edit-product-input-field'
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className='edit-product-label'>Price:</label>
                        <input
                            className='edit-product-input-field'
                            type="text"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className='edit-product-label'>Description:</label>
                        <textarea
                            className='edit-product-input-text-area'
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={12}
                            required
                        />
                    </div>


                    <button className='edit-product-button' type="submit">Update Product</button>
                </form>
            ):(<p>No product item found to edit</p>)}
               {isLoading && (
                <div className='loading-animation-container'>
                    <div className='loading-animation'>
                        <ClipLoader
                            color="#0066FF"
                            loading
                            size={19}
                        />
                        <span>Updating...</span>
                    </div>
                </div>
            )}
        </div>
    )
}
export default EditPost;
