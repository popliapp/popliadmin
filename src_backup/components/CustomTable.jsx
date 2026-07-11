import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { Visibility, Edit, Delete } from "@mui/icons-material";
import Block from "@mui/icons-material/Block";
import { UnfoldMore } from "@mui/icons-material";


export default function CustomTable({
  columns = [],
  rows = [],
  actions = {},          
  onView,
  onEdit,
  onDelete,
  onBlock,
  children
}) {
  const hasActions = actions?.view || actions?.edit || actions?.delete || actions.isBlock;

  if (!rows?.length) {
    return (
      <div className="bg-white rounded-lg p-6 text-center text-gray-500 border border-gray-200">
        No results found
      </div>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: 2,
        overflow: "visible",
        border: "1px solid rgba(224,224,224,1)",
      }}
      className="p-4"
    >
      {children ? <Box mb={2}>{children}</Box> : null}

      <Box sx={{ overflow: "auto" }}>
        <Table
          sx={{
            borderCollapse: "collapse",
            "& .MuiTableCell-root": {
              border: "1px solid rgba(224,224,224,1)",
            },
          }}
          className="p-2"
        >
          <TableHead>
            <TableRow>
              <TableCell></TableCell>

              {columns.map((col) => (
                <TableCell key={col.key}>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <Typography fontWeight={600}>{col.label}</Typography>
                    <UnfoldMore fontSize="small" sx={{ color: "grey.400" }} />
                  </Stack>
                </TableCell>
              ))}

              {hasActions && (
                <TableCell>
                  <Typography fontWeight={600}>Actions</Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, rowIndex) => (
              <TableRow key={row._id || row.id || rowIndex} hover>
                <TableCell>{rowIndex + 1}</TableCell>

                {columns.map((col, colIndex) => (
                  <TableCell key={`${col.key}-${rowIndex}-${colIndex}`}>
                    {col.render ? col.render(row, rowIndex) : row[col.key]}
                  </TableCell>
                ))}

                {hasActions && (
                  <TableCell>
                    <Stack direction="row" spacing={2}>
                      {actions.view && (
                        <Visibility
                          className="cursor-pointer hover:text-gray-900"
                          onClick={() => onView?.(row)}
                        />
                      )}

                      {actions.edit && (
                        <Edit
                          className="cursor-pointer hover:text-gray-900"
                          onClick={() => onEdit?.(row)}
                        />
                      )}

                      {actions.delete && (
                        <Delete
                          className="cursor-pointer hover:text-red-600"
                          onClick={() => onDelete?.(row)}
                        />
                      )}
                      {actions.isBlock && (
                        <Block
                          className="cursor-pointer hover:text-red-600"
                          color={!row.user?.isBlocked ? "error" : "success"}

                          onClick={() => onBlock?.(row)}
                        />
                      )}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </TableContainer>
  );
}
