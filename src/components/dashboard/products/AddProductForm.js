import React, { useState, useEffect } from "react";
import Form from "../../common/Form";
import { Grid } from "@material-ui/core";
import Controls from "../../common/controls/Controls";
import useForm from "../../common/useForm";
import UploadImageButton from "../../common/UploadImageButton";
import { connect } from "react-redux";
import { compose } from "redux";
import { firestoreConnect } from "react-redux-firebase";
import {
  createProduct,
  closeSnackbar,
  disableSubmit,
} from "../../../store/actions/productActions";
import { getTaxSelect, getUnitSelect } from "../common/constMaps";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from "../../common/controls/Button";
import { Link } from "react-router-dom";
import Typography from "@material-ui/core/Typography";

const taxSelect = getTaxSelect();

const unitSelect = getUnitSelect();

const initialFValues = {
  title: "",
  shortDescription: "",
  longDescription: "",
  category: 0,
  unitSelect: 0,
  unitValue: 0,
  price: 0,
  taxSelect: 0,
  discount: 0,
  tax: 0,
  imageData: "",
  visibility: true,
};

function AddProductForm(props) {
  const [sanckbarStatus, setSnackbarStatus] = useState(props.productStatus);

  useEffect(() => {
    setSnackbarStatus(props.productStatus);
  }, [props.productStatus]);

  const handleSnackbarClose = () => {
    props.closeSnackbar();
  };

  const validate = (fieldValues = values) => {
    let tmp = { ...errors };
    if ("title" in fieldValues)
      tmp.title = fieldValues.title ? "" : "This field is required.";
    if ("shortDescription" in fieldValues)
      tmp.shortDescription = fieldValues.shortDescription
        ? ""
        : "This field is required.";
    if ("longDescription" in fieldValues)
      tmp.longDescription = fieldValues.longDescription
        ? ""
        : "This field is required.";
    if ("category" in fieldValues)
      tmp.category = fieldValues.category
        ? ""
        : "Select a category or create new ";
    if ("unitValue" in fieldValues)
      tmp.unitValue =
        fieldValues.unitValue > 0
          ? ""
          : "Value should be a number and greater then 0";
    if ("price" in fieldValues)
      tmp.price =
        fieldValues.price > 0
          ? ""
          : "Price should be a number and greater then 0";
    if ("discount" in fieldValues)
      tmp.discount =
        fieldValues.discount >= 0
          ? ""
          : "Discount percentage should be a number and greater than or equal to zero";
    if ("tax" in fieldValues)
      tmp.tax =
        fieldValues.tax >= 0
          ? ""
          : "Tax percentage should be a number and greater than or equal to zero";
    if ("imageData" in fieldValues)
      tmp.imageData = values.imageData === "" ? "Image is required" : "";
    setErrors({
      ...tmp,
    });
    if (fieldValues === values)
      return Object.values(tmp).every((x) => x === "");
  };

  const {
    values,
    setValues,
    errors,
    setErrors,
    handleInputChange,
    handleSwitchChange,
    resetForm,
  } = useForm(initialFValues, true, validate);

  const calculateTotal = (price, discountPercentage, tax, taxSelect) => {
    var totalPrice = price;
    if (taxSelect === 0) {
      totalPrice -= totalPrice * (tax / 100);
    } else {
      totalPrice -= tax;
    }
    totalPrice -= totalPrice * (discountPercentage / 100);
    return totalPrice;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      var discount = parseFloat(values.discount, 10);
      var price = parseFloat(values.price);
      var unitValue = parseFloat(values.unitValue);
      var tax = parseFloat(values.tax, 10);
      var totalPrice = Math.ceil(
        calculateTotal(price, discount, tax, values.taxSelect)
      );
      // TODO: dont create product if total price is less than zero
      props.disableSubmit();
      props.createProduct({
        ...values,
        totalPrice: totalPrice,
        price: price,
        unitValue: unitValue,
        discount: discount,
        tax: tax,
      });
      resetForm();
    }
  };

  const getCategories = () => {
    const selectCategories = [{ id: 0, title: "None" }];
    if (props.categories) {
      for (var i = 0; i < props.categories.length; i++) {
        selectCategories.push({
          id: props.categories[i].id,
          title: props.categories[i].title,
        });
      }
    }
    return selectCategories;
  };

  const imageSave = (fileobjs) => {
    console.log("image saved called");
    if (fileobjs.length > 0) {
      setValues({
        ...values,
        imageData: fileobjs[0].data,
      });
    } else {
      setValues({
        ...values,
        imageData: "",
      });
    }
  };

  if (getCategories().length <= 1) {
    return (
      <>
        <Grid container justify="center">
          <Grid item>
            <Typography component="h5" variant="h4" color="primary">
              {" "}
              Add categories before adding products!{" "}
            </Typography>
          </Grid>
        </Grid>
        <Grid container justify="center">
          <Grid item>
            <Controls.Button
              component={Link}
              to="/myspace/products/addcategory"
              text={"Add categories"}
              color="primary"
            />
          </Grid>
        </Grid>
      </>
    );
  }

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <Grid container spacing={0} justify="center">
          <Grid xs={12} sm={6} item>
            <Controls.Switch
              name="visibility"
              label="Product Visibility"
              value={values.visibility}
              onChange={handleSwitchChange}
              color="primary"
            />
            <Controls.Input
              name="title"
              label="Title"
              value={values.title}
              onChange={handleInputChange}
              error={errors.title}
            />
            <Controls.InputArea
              name="shortDescription"
              label="Short Description"
              value={values.shortDescription}
              onChange={handleInputChange}
              error={errors.shortDescription}
              rowsMax={2}
            />
            <Controls.InputArea
              name="longDescription"
              label="Long Description"
              value={values.longDescription}
              onChange={handleInputChange}
              error={errors.longDescription}
              rowsMax={5}
            />
            <Controls.Select
              name="category"
              label="Category"
              value={values.category}
              onChange={handleInputChange}
              options={getCategories()}
              error={errors.category}
            />
          </Grid>
          <Grid xs={12} sm={6} item>
            <Grid xs={12} item container>
              <Grid xs={6} item>
                <Controls.Select
                  name="unitSelect"
                  label="Select Unit"
                  value={values.unitSelect ? values.unitSelect : 0}
                  onChange={handleInputChange}
                  options={unitSelect}
                  error={errors.uniSelect}
                />
              </Grid>
              <Grid xs={6} item>
                <Controls.Input
                  name="unitValue"
                  label="Value"
                  value={values.unitValue}
                  onChange={handleInputChange}
                  error={errors.unitValue}
                />
              </Grid>
            </Grid>
            <Grid xs={12} item container>
              <Grid xs={6} item>
                <Controls.Input
                  name="price"
                  label="Price"
                  value={values.price}
                  onChange={handleInputChange}
                  error={errors.price}
                />
              </Grid>
              <Grid xs={6} item>
                <Controls.Input
                  name="discount"
                  label="Discount Percentage"
                  value={values.discount}
                  onChange={handleInputChange}
                  error={errors.discount}
                />
              </Grid>
              <Grid xs={12} item container>
                <Grid xs={6} item>
                  <Controls.Select
                    name="taxSelect"
                    label="Tax Type"
                    value={values.taxSelect ? values.taxSelect : 0}
                    onChange={handleInputChange}
                    options={taxSelect}
                    error={errors.taxSelect}
                  />
                </Grid>
                <Grid xs={6} item>
                  <Controls.Input
                    name="tax"
                    label="Tax Value"
                    value={values.tax}
                    onChange={handleInputChange}
                    error={errors.tax}
                  />
                </Grid>
                <Grid xs={12} item>
                  <UploadImageButton callbackSave={imageSave} />
                </Grid>
                <Grid xs={12} item container justify="center">
                  <Grid item>
                    <Controls.ImageView
                      alt="Product uploaded"
                      src={
                        values.imageData === ""
                          ? "/imgs/default.jpg"
                          : values.imageData
                      }
                      width={130}
                      error={errors.imageData}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid xs={12} item container alignItems="center">
            <Grid item>
              <div>
                <Controls.Button
                  disabled={sanckbarStatus.disableSubmit}
                  type="submit"
                  text="Submit"
                />
              </div>
            </Grid>
            <Grid item>
              <CircularProgress
                size={30}
                style={!sanckbarStatus.disableSubmit && { display: "none" }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Form>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={sanckbarStatus.snackbarStatus}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        key={"topright"}
      >
        <Alert onClose={handleSnackbarClose} severity={sanckbarStatus.variant}>
          {sanckbarStatus.message}
        </Alert>
      </Snackbar>
    </>
  );
}

const mapStateToProps = (state) => {
  console.log(state);
  return {
    categories: state.firestore.ordered.categories,
    productStatus: state.product,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    createProduct: (product) => dispatch(createProduct(product)),
    closeSnackbar: () => dispatch(closeSnackbar()),
    disableSubmit: () => dispatch(disableSubmit()),
  };
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  firestoreConnect([
    {
      collection: "categories",
    },
  ])
)(AddProductForm);
