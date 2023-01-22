import { useState } from "react";
import { IErrorShema } from "../interfaces";

// MUI Component
import {
  Box,
  TextField,
  FormControlLabel,
  FormControl,
  RadioGroup,
  FormLabel,
  Radio,
  Button,
  FormHelperText,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { theme, colors } from "../style";

// Date
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import dayjs from "dayjs";
import "dayjs/locale/it";

const errosShema: IErrorShema = {
  name: { state: false, message: "" },
  age: { state: false, message: "" },
  birthday: { state: false, message: "" },
  married: { state: false, message: "" },
};

const CheckProfile = () => {
  const [birthday, setBirthday] = useState(dayjs(new Date()).locale("it"));
  const [title, setTitle] = useState({
    title: "Update My Profile.",
    color: colors.secondary,
  });
  const [loading, setLoading] = useState(false);
  const [marriedValue, setMarriedValue] = useState("null");
  const [errors, setErrors] = useState<IErrorShema>({ ...errosShema });

  const handleSubmit = (values: any) => {
    setLoading(true);

    values.preventDefault();
    const formData = new FormData(values.currentTarget);
    let married;
    if (marriedValue === "yes") {
      married = true;
    } else if (marriedValue === "no") {
      married = false;
    }

    fetch("http://localhost:3001/user/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.get("name"),
        age: formData.get("age") ? Number(formData.get("age")) : 0,
        birthday: birthday,
        married: married,
      }),
    })
      .then((response) => {
        if ([200, 201].includes(response.status)) {
          return response.json();
        } else {
          throw new Error();
        }
      })
      .then((response) => {
        console.log(response);
        if (response.success) {
          setTitle({ title: "DATA SENT VALID !", color: "#6D9886" });

          setErrors({
            ...errosShema,
            name: { ...errosShema.name, state: false },
            age: { ...errosShema.age, state: false },
            birthday: { ...errosShema.birthday, state: false },
            married: { ...errosShema.married, state: false },
          });
        } else {
          const errorFields = response.errors.map((error: any) => ({
            fieldName: error.property,
            errorMessage: error.constraints,
          }));

          setErrors((currErrors: any) => {
            errorFields.forEach((errorField: any) => {
              if (currErrors[errorField.fieldName]) {
                currErrors[errorField.fieldName].state = true;
                const key = Object.keys(errorField.errorMessage)[0];
                currErrors[errorField.fieldName].message =
                  errorField.errorMessage[key];
              }
            });

            return { ...currErrors };
          });

          setTitle({ title: "DATA SENT INVALID !", color: "#FFD24C" });
        }
      })
      .catch((e) => {
        console.log(e);
        setTitle({ title: "DATA SENDING ERROR", color: "#EB455F" });
      })
      .finally(() => {
        setTimeout(() => {
          setTitle({ title: "Update My Profile.", color: colors.secondary });
        }, 3000);
        setLoading(false);
      });
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        m="20px"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "80vh",
        }}
      >
        <Box
          width="700px"
          height="700px"
          display="flex"
          justifyContent="space-evenly"
          alignItems="center"
          sx={{
            boxShadow: "0.5rem 0.5rem black, -0.5rem -0.5rem #7286d3",
            border: "1px solid",
          }}
          flexDirection="column"
        >
          <h1
            style={{
              gridColumn: "span 4",
              justifySelf: "center",
              color: title.color,
              fontSize: "2.6em",
            }}
          >
            {title.title}
          </h1>

          <Box
            component="form"
            onSubmit={loading ? undefined : handleSubmit}
            width="600px"
            color="#000"
            id="form-profile"
          >
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="repeat(4, minmax(0, 1fr))"
              marginBottom="28px"
            >
              <TextField
                required
                error={errors.name.state}
                helperText={errors.name.state ? errors.name.message : ""}
                onChange={() => {
                  if (errors.name.state) {
                    setErrors({
                      ...errors,
                      name: {
                        state: false,
                        message: "",
                      },
                    });
                  }
                }}
                label="Name"
                name="name"
                type="text"
                variant="filled"
                sx={{
                  gridColumn: "span 4",
                  "& label.Mui-focused": {
                    color: "#000",
                  },
                }}
              />
              <TextField
                required
                label="Age"
                name="age"
                type="number"
                error={errors.age.state}
                helperText={errors.age.state ? errors.age.message : ""}
                variant="filled"
                onChange={() => {
                  if (errors.age.state) {
                    setErrors({
                      ...errors,
                      age: {
                        state: false,
                        message: "",
                      },
                    });
                  }
                }}
                sx={{
                  gridColumn: "span 4",
                  "& label.Mui-focused": {
                    color: "#000",
                  },
                }}
              />

              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale={"it"}
              >
                <DesktopDatePicker
                  label="Date of Birth"
                  inputFormat="MM/DD/YYYY"
                  onChange={(value) => {
                    if (value) {
                      setBirthday(value);
                    }

                    if (errors.birthday.state) {
                      setErrors({
                        ...errors,
                        birthday: {
                          state: false,
                          message: "",
                        },
                      });
                    }
                  }}
                  value={birthday}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      name="birthday"
                      error={errors.birthday.state}
                      helperText={
                        errors.birthday.state ? errors.birthday.message : ""
                      }
                      variant="filled"
                      sx={{
                        gridColumn: "span 4",
                        "& label.Mui-focused": {
                          color: "#000",
                        },
                      }}
                      required
                    />
                  )}
                />
              </LocalizationProvider>

              <Box
                display="flex"
                justifyContent="space-between"
                gridColumn="span 4"
              >
                <FormControl error={errors.married.state}>
                  <FormLabel
                    sx={{
                      fontWeight: "bold",
                    }}
                    id="demo-controlled-radio-buttons-group"
                  >
                    Married
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-controlled-radio-buttons-group"
                    name="married"
                    value={marriedValue}
                    onChange={(event) => {
                      setMarriedValue(event.currentTarget.value);

                      if (errors.married.state) {
                        setErrors({
                          ...errors,
                          married: {
                            state: false,
                            message: "",
                          },
                        });
                      }
                    }}
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label="No"
                    />
                    <FormControlLabel
                      value="null"
                      control={<Radio />}
                      label="Nothing"
                    />
                  </RadioGroup>
                  <FormHelperText>
                    {errors.married.state ? errors.married.message : ""}
                  </FormHelperText>
                </FormControl>
                <span style={{ fontWeight: "bold", color: colors.grey }}>
                  Obligatory 18+
                </span>
              </Box>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              className="glow-on-hover"
              sx={{
                marginTop: "20px",
                color: "#fff",
                fontSize: "19px",
              }}
            >
              {loading ? "Loading..." : "Conferm"}
            </Button>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default CheckProfile;
