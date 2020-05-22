import { Button, FormControl, Grid, InputLabel, makeStyles, MenuItem, Paper, Select, SelectProps } from '@material-ui/core';
import { Field, Form, Formik, useField, useFormikContext } from 'formik';
import { GetServerSideProps } from 'next';
import router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { getMakes, Make } from '../database/getMakes';
import { getModels, Model } from '../database/getModels';
import { getAsString } from '../getAsString';

export interface SearchProps {
  makes: Make[];
  models: Model[];
  singleColumn?: boolean;
}

const useStyles = makeStyles((theme) => ({
  paper: {
    margin: 'auto',
    maxWidth: 500,
    padding: theme.spacing(3),
  },
}));

const prices = [500, 1000, 5000, 15000, 25000, 50000, 250000];

export default function Search({ makes, models, singleColumn }: SearchProps) {
  const classes = useStyles();
  const { query } = useRouter();
  const smValue = singleColumn ? 12 : 6;

  const [initialValues] = useState({
    make: getAsString(query.make) || 'all',
    model: getAsString(query.model) || 'all',
    minPrice: getAsString(query.minPrice) || 'all',
    maxPrice: getAsString(query.maxPrice) || 'all',
  });

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={(values) => {
        router.push(
          {
            pathname: '/cars',
            query: { ...values, page: 1 },
          },
          undefined,
          { shallow: true }
        );
      }}
    >
      {({ values }) => (
        <Form>
          <Paper elevation={5} className={classes.paper}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={smValue}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="search-make">Make</InputLabel>
                  <Field
                    name="make"
                    as={Select}
                    labelId="search-make"
                    label="Make"
                  >
                    <MenuItem value="all">
                      <em>All Makes</em>
                    </MenuItem>
                    {makes.map((make) => (
                      <MenuItem key={make.make} value={make.make}>
                        {`${make.make} (${make.count})`}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <ModelSelect initialMake={initialValues.make} make={values.make} name="model" models={models} />
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="search-min-price">Min Price</InputLabel>
                  <Field
                    name="minPrice"
                    as={Select}
                    labelId="search-min-price"
                    label="Min Price"
                  >
                    <MenuItem value="all">
                      <em>No Min</em>
                    </MenuItem>
                    {prices.map((price) => (
                      <MenuItem key={price} value={price}>
                        {price}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={smValue}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel id="search-max-price">Max Price</InputLabel>
                  <Field
                    name="maxPrice"
                    as={Select}
                    labelId="search-max-price"
                    label="Max Price"
                  >
                    <MenuItem value="all">
                      <em>No Max</em>
                    </MenuItem>
                    {prices.map((price) => (
                      <MenuItem key={price} value={price}>
                        {price}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                >
                  Search
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Form>
      )}
    </Formik>
  );
}

export interface ModelSelectProps extends SelectProps {
  name: string;
  models: Model[];
  make: string;
  initialMake: string;
}

export function ModelSelect({ initialMake, models, make, ...props }: ModelSelectProps) {
  const { setFieldValue } = useFormikContext();
  const [field] = useField({
    name: props.name
  });

  const initialModelsOrUndefined = make === initialMake ? models : undefined;

  const { data: newModels } = useSWR<Model[]>('/api/models?make=' + make, {
    dedupingInterval: 60000,
    initialData: make === 'all' ? [] : initialModelsOrUndefined 
  });

  useEffect(() => {
    if (!newModels?.map((a) => a.model).includes(field.value)) {
      setFieldValue('model', 'all');
    }
  }, [make, newModels]);

  return (
    <FormControl fullWidth variant="outlined">
      <InputLabel id="search-model">Model</InputLabel>
      <Select
        name="model"
        labelId="search-model"
        label="Model"
        {...field}
        {...props}
      >
        <MenuItem value="all">
          <em>All Models</em>
        </MenuItem>
        {newModels?.map((model) => (
          <MenuItem key={model.model} value={model.model}>
            {`${model.model} (${model.count})`}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export const getServerSideProps: GetServerSideProps<SearchProps> = async (
  ctx
) => {
  const make = getAsString(ctx.query.make);

  const [makes, models] = await Promise.all([getMakes(), getModels(make)]);

  return { props: { makes, models } };
};
