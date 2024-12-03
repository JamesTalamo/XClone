const RightPanelSkeleton = () => {
	return (
		<div className='flex flex-col gap-2 w-52 my-2'>
			<div className='flex gap-2 items-center'>
				<div className='skeleton w-8 h-8 rounded-full shrink-0  bg-slate-800'></div>
				<div className='flex flex-1 justify-between'>
					<div className='flex flex-col gap-1'>
						<div className='skeleton h-2 w-12 rounded-full  bg-slate-800'></div>
						<div className='skeleton h-2 w-16 rounded-full  bg-slate-800'></div>
					</div>
					<div className='skeleton h-6 w-14 rounded-full  bg-slate-800'></div>
				</div>
			</div>
		</div>
	);
};
export default RightPanelSkeleton;