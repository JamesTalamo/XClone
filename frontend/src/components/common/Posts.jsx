import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType, username, userId }) => {
	// const isLoading = false;
	const getPostEndPoint = () => {
		switch (feedType) {
			case "forYou":
				return `${import.meta.env.VITE_BACKEND_URI}/api/post/all`
			case "following":
				return `${import.meta.env.VITE_BACKEND_URI}/api/post/following`
			case "posts":
				return `${import.meta.env.VITE_BACKEND_URI}/api/post/user/${username}`
			case "likes":
				return `${import.meta.env.VITE_BACKEND_URI}/api/post/likes/${userId}`
			default:
				return `${import.meta.env.VITE_BACKEND_URI}/api/post/all`
		}
	}

	const POST_ENDPOINT = getPostEndPoint()

	const { data: posts, isLoading } = useQuery({
		queryKey: ["post", POST_ENDPOINT],
		queryFn: async () => {
			try {
				const res = await fetch(POST_ENDPOINT, {
					credentials: 'include'
				})
				const data = await res.json()
				if (!res.ok) throw new Error(data.error || "Something Went Wrong.")

				return data
			} catch (error) {
				throw new Error(error)
			}
		}
	})

	return (
		<>
			{isLoading && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && <p className='text-center my-4'>No posts in this tab. Switch 👻</p>}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;