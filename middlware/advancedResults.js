const advancedResults = (model, populate) => async (req, res, next) => {
  let query;

  // copy query from url => MAIN QUERY STRING
  const reqQuery = { ...req.query };

  // field to exclude
  const removeFields = ["select", "sort", "page", "limit"];
  // loop over removeFields and delete them from Query
  removeFields.forEach((param) => delete reqQuery[param]);

  // CREATE QUERY STRING
  let queryStr = JSON.stringify(reqQuery);
  // create operator ($gt, $gte, ...)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // run query statement => finding Resource => BUILD A QUERY
  query = model.find(JSON.parse(queryStr));
  //   {
  //     path: "courses",
  //     select: "title tuition",
  //   }

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    // - => descending
    query = query.sort("createdAt");
  }

  // PAGINATION
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 2;
  const startIndex = (page - 1) * limit; // amount to skip
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // POPULATE
  if (populate) {
    query = query.populate(populate);
  }

  // EXECUTING QUERY
  const results = await query;

  // PAGINATION result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  // assign "advancedResults" to "res"
  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
