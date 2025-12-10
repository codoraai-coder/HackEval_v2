// const asyncHandler = ()=>{}

// making wrapper which you can use to other files

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export { asyncHandler };

// function in function (one way)
// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next);
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message:error.message
//         })
//     }
// }

// NOTES

// const asyncHandler = () => {}
// const asyncHandler = (func) => () => {}
// const asyncHandler = (func) => async () => {}

// Calling next(err) tells Express that an error has occurred, so it moves to the error-handling middleware.
