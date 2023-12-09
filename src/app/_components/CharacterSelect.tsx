import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { images } from "../const/images";

type Props = {
  character: string;
  handleChange: (event: SelectChangeEvent) => void;
};

export const CharacterSelect = ({ character, handleChange }: Props) => {
  return (
    <FormControl fullWidth style={{ position: "relative" }}>
      <InputLabel id="demo-simple-select-label">Age</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={character}
        defaultValue={images.luffy.name}
        label="Character"
        onChange={handleChange}
      >
        {Object.values(images).map((image) => (
          <MenuItem value={image.path} key={image.name}>
            {image.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
