// frontend/src/partials/AddPropertySections.jsx
import React, { useRef, useState } from "react";
import { Add, Form } from "../components";

const Description = ({ form, onChange }) => {
  return (
    <Add.Description>
      <Add.DescriptionHeader>
        <Add.Title>Description</Add.Title>
      </Add.DescriptionHeader>
      <Add.DescriptionContent>
        <Add.DescriptionContentTop>
          <Form.FormGroup>
            <Form.Label>
              Property Title <span>(required)</span>
            </Form.Label>
            <Form.Input
              name="title"
              value={form.title || ""}
              onChange={onChange}
              required
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>
              Property Price <span>(required)</span>
            </Form.Label>
            <Form.Input
              name="price"
              type="number"
              min="0"
              value={form.price || ""}
              onChange={onChange}
              required
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>
              Category <span>(required)</span>
            </Form.Label>
            <Form.Select
              name="category"
              value={form.category || ""}
              onChange={onChange}
              required
            >
              <Form.Option value="">None</Form.Option>
              <Form.Option value="Apartment">Apartment</Form.Option>
              <Form.Option value="House">House</Form.Option>
              <Form.Option value="Land">Land</Form.Option>
            </Form.Select>
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>
              Listed In <span>(required)</span>
            </Form.Label>
            <Form.Select
              name="listedIn"
              value={form.listedIn || ""}
              onChange={onChange}
              required
            >
              <Form.Option value="">None</Form.Option>
              <Form.Option value="rental">Rental</Form.Option>
              <Form.Option value="sales">Sales</Form.Option>
            </Form.Select>
          </Form.FormGroup>
        </Add.DescriptionContentTop>

        <Add.DescriptionContentBottom>
          <Form.FormGroup>
            <Form.Label>
              Description <span>(required)</span>
            </Form.Label>
            <Form.TextArea
              name="description"
              rows="8"
              value={form.description || ""}
              onChange={onChange}
              required
            />
          </Form.FormGroup>
        </Add.DescriptionContentBottom>
      </Add.DescriptionContent>
    </Add.Description>
  );
};

const Location = ({ form, onChange }) => {
  return (
    <Add.Location>
      <Add.LocationHeader>
        <Add.Title>Property Location</Add.Title>
      </Add.LocationHeader>
      <Add.LocationContent>
        <Add.LocationContentTop>
          <Form.FormGroup>
            <Form.Label>
              Address <span>(required)</span>
            </Form.Label>
            <Form.Input
              name="address"
              type="text"
              value={form.address || ""}
              onChange={onChange}
              required
            />
          </Form.FormGroup>
        </Add.LocationContentTop>

        <Add.LocationContentBottom>
          <Form.FormGroup>
            <Form.Label>
              County<span>(required)</span>
            </Form.Label>
            <Form.Input
              name="county"
              type="text"
              value={form.county || ""}
              onChange={onChange}
              required
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>
              Town<span>(required)</span>
            </Form.Label>
            <Form.Input
              name="town"
              type="text"
              value={form.town || ""}
              onChange={onChange}
              required
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>
              Latitude<span>(for google maps)</span>
            </Form.Label>
            <Form.Input
              name="latitude"
              type="number"
              step="any"
              value={form.latitude || ""}
              onChange={onChange}
            />
          </Form.FormGroup>

          <Form.FormGroup>
            <Form.Label>
              Longitude<span>(for google maps)</span>
            </Form.Label>
            <Form.Input
              name="longitude"
              type="number"
              step="any"
              value={form.longitude || ""}
              onChange={onChange}
            />
          </Form.FormGroup>
        </Add.LocationContentBottom>
      </Add.LocationContent>
    </Add.Location>
  );
};

const Media = ({ onFiles }) => {
  const hiddenFileInput = useRef(null);
  const [previews, setPreviews] = useState([]);

  const handleFileButton = (e) => {
    e.preventDefault();
    hiddenFileInput.current?.click();
  };

  const onChangeFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    onFiles(files);
  };

  return (
    <Add.Media>
      <Add.MediaHeader>
        <Add.Title>Property Images</Add.Title>
      </Add.MediaHeader>
      <Add.MediaContent>
        <Form.FormGroup>
          <Form.Label>Images</Form.Label>
          <input
            type="file"
            ref={hiddenFileInput}
            style={{ display: "none" }}
            accept="image/*"
            multiple
            onChange={onChangeFiles}
            name="images"
          />
          <Add.Button onClick={handleFileButton}>Upload Files</Add.Button>
        </Form.FormGroup>

        {previews?.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginTop: 12 }}>
            {previews.map((src, i) => (
              <img key={i} src={src} alt={`preview-${i}`} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8 }} />
            ))}
          </div>
        )}
      </Add.MediaContent>
    </Add.Media>
  );
};

const Details = ({ form, onChange }) => {
  return (
    <Add.Details>
      <Add.DetailsHeader>
        <Add.Title>Property Details</Add.Title>
      </Add.DetailsHeader>
      <Add.DetailsContent>
        <Form.FormGroup>
          <Form.Label>Rooms</Form.Label>
          <Form.Input
            name="rooms"
            type="number"
            min="0"
            value={form.rooms || ""}
            onChange={onChange}
          />
        </Form.FormGroup>

        <Form.FormGroup>
          <Form.Label>Bedrooms</Form.Label>
          <Form.Input
            name="bedrooms"
            type="number"
            min="0"
            value={form.bedrooms || ""}
            onChange={onChange}
          />
        </Form.FormGroup>

        <Form.FormGroup>
          <Form.Label>Bathrooms</Form.Label>
          <Form.Input
            name="bathrooms"
            type="number"
            min="0"
            value={form.bathrooms || ""}
            onChange={onChange}
          />
        </Form.FormGroup>

        <Form.FormGroup>
          <Form.Label>Structure Type</Form.Label>
          <Form.Select
            name="structureType"
            value={form.structureType || ""}
            onChange={onChange}
            className="form-select"   // ✅ React = className
          >
            <Form.Option value="">Not Available</Form.Option>
            <Form.Option value="Brick">Brick</Form.Option>
            <Form.Option value="Wood">Wood</Form.Option>
            <Form.Option value="Cement">Cement</Form.Option>
          </Form.Select>
        </Form.FormGroup>
      </Add.DetailsContent>
    </Add.Details>
  );
};

export { Description, Location, Media, Details };
// alias عشان ما يكسر imports القديمة
export { Description as Descrition };
